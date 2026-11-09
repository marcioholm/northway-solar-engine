import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity';
import { UserInvite } from './entities/user-invite.entity';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { Lead } from '../leads/entities/lead.entity';
import { SolarProject } from '../solar-project/entities/solar-project.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { CreateInviteDto, AcceptInviteDto, ResetPasswordDto } from './dto/invite.dto';
import { UpdateMemberDto, ReassignMemberDto } from './dto/member.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @InjectRepository(UserInvite)
    private invitesRepository: Repository<UserInvite>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(SolarProject)
    private solarProjectsRepository: Repository<SolarProject>,
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    private usersService: UsersService,
    private companiesService: CompaniesService,
  ) {}

  private hashToken(rawToken: string): string {
    return crypto.createHash('sha256').update(rawToken).digest('hex');
  }

  private getFrontendBaseUrl(): string {
    return (
      process.env.FRONTEND_URL?.replace(/\/$/, '') ||
      'https://northway-solar-engine.vercel.app'
    );
  }

  private async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      this.logger.log(`[RESEND] Sem RESEND_API_KEY no ambiente. Link disponível na tela.`);
      return false;
    }

    try {
      const fromEmail = process.env.EMAIL_FROM || 'SolarOS <onboarding@resend.dev>';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        this.logger.warn(`[RESEND] Falha ao enviar e-mail: ${errText}`);
        return false;
      }
      return true;
    } catch (err: any) {
      this.logger.warn(`[RESEND] Erro ao enviar e-mail: ${err?.message}`);
      return false;
    }
  }

  // ────────── LISTAR EQUIPE (Admin) ──────────

  async getTeam(companyId: string) {
    const company = await this.companiesService.findOne(companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada');

    const users = await this.usersRepository.find({
      where: { companyId },
      order: { createdAt: 'ASC' },
    });

    const pendingInvites = await this.invitesRepository.find({
      where: {
        companyId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
        type: 'invite',
      },
      order: { createdAt: 'DESC' },
    });

    const activeUsersCount = users.filter((u) => u.isActive).length;
    const pendingInvitesCount = pendingInvites.length;

    return {
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        phone: u.phone,
        isActive: u.isActive,
        lastLoginAt: u.lastLoginAt,
        deactivatedAt: u.deactivatedAt,
        createdAt: u.createdAt,
      })),
      invites: pendingInvites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        name: inv.name,
        phone: inv.phone,
        role: inv.role,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
      })),
      plan: company.plan || 'basic',
      maxUsers: company.maxUsers,
      activeUsersCount,
      pendingInvitesCount,
    };
  }

  // ────────── CRIAR CONVITE (Admin) ──────────

  async createInvite(companyId: string, createdBy: string, dto: CreateInviteDto) {
    if (dto.role === UserRole.SUPERADMIN) {
      throw new BadRequestException('Não é permitido criar convite para perfil superadmin');
    }

    const company = await this.companiesService.findOne(companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada');

    // Validação de limite por plano
    const activeUsers = await this.usersRepository.countBy({ companyId, isActive: true });
    const pendingInvites = await this.invitesRepository.count({
      where: {
        companyId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
        type: 'invite',
      },
    });

    if (company.maxUsers != null && activeUsers + pendingInvites >= company.maxUsers) {
      throw new ForbiddenException(
        `Limite de usuários do plano (${company.maxUsers}) atingido. Faça upgrade do plano para adicionar mais membros.`,
      );
    }

    // Verifica se já existe usuário ativo com este e-mail
    const existingUser = await this.usersRepository.findOneBy({ email: dto.email.trim().toLowerCase() });
    if (existingUser && existingUser.isActive) {
      throw new BadRequestException('Já existe um usuário ativo com este e-mail');
    }

    // Invalida convites pendentes anteriores para o mesmo e-mail nesta empresa
    await this.invitesRepository.update(
      {
        companyId,
        email: dto.email.trim().toLowerCase(),
        usedAt: IsNull(),
      },
      { usedAt: new Date() },
    );

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000); // 48h

    const invite = this.invitesRepository.create({
      companyId,
      email: dto.email.trim().toLowerCase(),
      name: dto.name?.trim() || null,
      phone: dto.phone?.trim() || null,
      role: dto.role,
      tokenHash,
      type: 'invite',
      expiresAt,
      createdBy,
    });

    const savedInvite = await this.invitesRepository.save(invite);
    const inviteUrl = `${this.getFrontendBaseUrl()}/convite/${rawToken}`;

    // Tenta enviar e-mail se RESEND_API_KEY configurada
    await this.sendEmail(
      savedInvite.email,
      `Convite para participar da equipe ${company.name}`,
      `
        <h2>Você foi convidado para a equipe ${company.name}!</h2>
        <p>Olá${savedInvite.name ? ' ' + savedInvite.name : ''},</p>
        <p>Você recebeu um convite para acessar o SolarOS como <strong>${savedInvite.role}</strong>.</p>
        <p>Para ativar sua conta e definir sua senha, acesse o link abaixo (válido por 48 horas):</p>
        <p><a href="${inviteUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Aceitar Convite</a></p>
        <p>Ou copie o link: ${inviteUrl}</p>
      `,
    );

    return {
      id: savedInvite.id,
      email: savedInvite.email,
      role: savedInvite.role,
      expiresAt: savedInvite.expiresAt,
      inviteUrl,
      rawToken,
    };
  }

  // ────────── REENVIAR CONVITE (Admin) ──────────

  async resendInvite(companyId: string, inviteId: string) {
    const invite = await this.invitesRepository.findOne({
      where: { id: inviteId, companyId, usedAt: IsNull() },
    });
    if (!invite) throw new NotFoundException('Convite pendente não encontrado');

    const company = await this.companiesService.findOne(companyId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    invite.tokenHash = this.hashToken(rawToken);
    invite.expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    const savedInvite = await this.invitesRepository.save(invite);
    const inviteUrl = `${this.getFrontendBaseUrl()}/convite/${rawToken}`;

    if (company) {
      await this.sendEmail(
        savedInvite.email,
        `Convite para participar da equipe ${company.name}`,
        `
          <h2>Seu convite para a equipe ${company.name} foi reenviado!</h2>
          <p>Para ativar sua conta e definir sua senha, acesse o link abaixo (válido por 48 horas):</p>
          <p><a href="${inviteUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Aceitar Convite</a></p>
          <p>Ou copie o link: ${inviteUrl}</p>
        `,
      );
    }

    return {
      id: savedInvite.id,
      email: savedInvite.email,
      expiresAt: savedInvite.expiresAt,
      inviteUrl,
      rawToken,
    };
  }

  // ────────── CANCELAR CONVITE (Admin) ──────────

  async deleteInvite(companyId: string, inviteId: string) {
    const invite = await this.invitesRepository.findOne({
      where: { id: inviteId, companyId },
    });
    if (!invite) throw new NotFoundException('Convite não encontrado');
    await this.invitesRepository.remove(invite);
    return { success: true };
  }

  // ────────── ATUALIZAR MEMBRO (Admin) ──────────

  async updateMember(
    companyId: string,
    memberId: string,
    adminUserId: string,
    dto: UpdateMemberDto,
  ) {
    const user = await this.usersRepository.findOneBy({ id: memberId, companyId });
    if (!user) throw new NotFoundException('Usuário não encontrado nesta empresa');

    // Proteção: admin não pode rebaixar a si mesmo
    if (adminUserId === memberId && dto.role && dto.role !== UserRole.ADMIN) {
      throw new BadRequestException('Você não pode alterar seu próprio perfil de administrador');
    }

    // Proteção: ninguém cria ou promove para superadmin
    if (dto.role === UserRole.SUPERADMIN) {
      throw new BadRequestException('Não é permitido promover usuário para superadmin');
    }

    // Proteção: não pode deixar a empresa sem admin ativo
    if (user.role === UserRole.ADMIN && dto.role && dto.role !== UserRole.ADMIN) {
      const activeAdmins = await this.usersService.countActiveAdmins(companyId);
      if (activeAdmins <= 1) {
        throw new BadRequestException('A empresa precisa ter pelo menos um administrador ativo');
      }
    }

    const updateData: Partial<User> = {};
    if (dto.name !== undefined) updateData.name = dto.name.trim();
    if (dto.role !== undefined) updateData.role = dto.role;
    if (dto.phone !== undefined) updateData.phone = dto.phone.trim() || null;

    const updated = await this.usersService.update(memberId, updateData);
    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone: updated.phone,
      isActive: updated.isActive,
    };
  }

  // ────────── DESATIVAR MEMBRO (Admin) ──────────

  async deactivateMember(companyId: string, memberId: string, adminUserId: string) {
    const user = await this.usersRepository.findOneBy({ id: memberId, companyId });
    if (!user) throw new NotFoundException('Usuário não encontrado nesta empresa');

    if (adminUserId === memberId) {
      throw new BadRequestException('Você não pode desativar sua própria conta');
    }

    if (user.role === UserRole.ADMIN) {
      const activeAdmins = await this.usersService.countActiveAdmins(companyId);
      if (activeAdmins <= 1) {
        throw new BadRequestException('Não é possível desativar o único administrador ativo da empresa');
      }
    }

    await this.usersService.update(memberId, {
      isActive: false,
      deactivatedAt: new Date(),
    });

    const activeLeadsCount = await this.leadsRepository.count({
      where: { companyId, assignedTo: memberId },
    });

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: false,
      },
      activeLeadsCount,
    };
  }

  // ────────── REATIVAR MEMBRO (Admin) ──────────

  async reactivateMember(companyId: string, memberId: string) {
    const user = await this.usersRepository.findOneBy({ id: memberId, companyId });
    if (!user) throw new NotFoundException('Usuário não encontrado nesta empresa');

    const company = await this.companiesService.findOne(companyId);
    if (!company) throw new NotFoundException('Empresa não encontrada');

    const activeUsers = await this.usersRepository.countBy({ companyId, isActive: true });
    const pendingInvites = await this.invitesRepository.count({
      where: {
        companyId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
        type: 'invite',
      },
    });

    if (company.maxUsers != null && activeUsers + pendingInvites >= company.maxUsers) {
      throw new ForbiddenException(
        `Limite de usuários do plano (${company.maxUsers}) atingido. Faça upgrade para reativar membros.`,
      );
    }

    const updated = await this.usersService.update(memberId, {
      isActive: true,
      deactivatedAt: null,
    });

    return {
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        isActive: true,
      },
    };
  }

  // ────────── GERAR RESET DE SENHA (Admin) ──────────

  async generatePasswordReset(companyId: string, memberId: string, adminUserId: string) {
    const user = await this.usersRepository.findOneBy({ id: memberId, companyId });
    if (!user) throw new NotFoundException('Usuário não encontrado nesta empresa');

    const company = await this.companiesService.findOne(companyId);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

    const invite = this.invitesRepository.create({
      companyId,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenHash,
      type: 'reset',
      expiresAt,
      createdBy: adminUserId,
    });

    await this.invitesRepository.save(invite);
    const resetUrl = `${this.getFrontendBaseUrl()}/redefinir-senha/${rawToken}`;

    if (company) {
      await this.sendEmail(
        user.email,
        `Redefinição de senha - ${company.name}`,
        `
          <h2>Redefinição de senha solicitada</h2>
          <p>Olá ${user.name},</p>
          <p>Um administrador solicitou a redefinição da sua senha de acesso ao SolarOS.</p>
          <p>Para cadastrar uma nova senha, acesse o link abaixo (válido por 48 horas):</p>
          <p><a href="${resetUrl}" style="background:#059669;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;">Redefinir Senha</a></p>
          <p>Ou copie o link: ${resetUrl}</p>
        `,
      );
    }

    return {
      resetUrl,
      rawToken,
    };
  }

  // ────────── REATRIBUIR DADOS EM MASSA (Admin / Gestor) ──────────

  async reassignMemberData(
    companyId: string,
    fromUserId: string,
    dto: ReassignMemberDto,
  ) {
    const targetUser = await this.usersRepository.findOneBy({
      id: dto.toUserId,
      companyId,
    });

    if (!targetUser || !targetUser.isActive) {
      throw new BadRequestException('Usuário de destino não encontrado ou inativo nesta empresa');
    }

    const leadsResult = await this.leadsRepository.update(
      { companyId, assignedTo: fromUserId },
      { assignedTo: dto.toUserId },
    );

    const projectsResult = await this.solarProjectsRepository.update(
      { companyId, ownerUserId: fromUserId },
      { ownerUserId: dto.toUserId },
    );

    const proposalsResult = await this.proposalsRepository.update(
      { companyId, ownerUserId: fromUserId },
      { ownerUserId: dto.toUserId },
    );

    return {
      reassignedLeads: leadsResult.affected || 0,
      reassignedProjects: projectsResult.affected || 0,
      reassignedProposals: proposalsResult.affected || 0,
    };
  }

  // ────────── PÚBLICO: CONSULTAR CONVITE ──────────

  async getInvitePublic(rawToken: string) {
    const tokenHash = this.hashToken(rawToken);
    const invite = await this.invitesRepository.findOne({
      where: { tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()), type: 'invite' },
      relations: ['company'],
    });

    if (!invite) {
      throw new NotFoundException('Convite inválido ou expirado');
    }

    return {
      email: invite.email,
      role: invite.role,
      companyName: invite.company?.name || 'Sua Empresa',
      name: invite.name,
    };
  }

  // ────────── PÚBLICO: ACEITAR CONVITE ──────────

  async acceptInvite(dto: AcceptInviteDto) {
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('A senha deve ter no mínimo 8 caracteres');
    }

    const tokenHash = this.hashToken(dto.token);
    const invite = await this.invitesRepository.findOne({
      where: { tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()), type: 'invite' },
    });

    if (!invite) {
      throw new NotFoundException('Convite inválido ou expirado');
    }

    // Regra: aceitar convite usa a companyId e o perfil DO CONVITE
    const existingUser = await this.usersRepository.findOneBy({ email: invite.email });
    const passwordHash = await bcrypt.hash(dto.password, 10);

    let savedUser: User;
    if (existingUser) {
      existingUser.companyId = invite.companyId;
      existingUser.role = invite.role;
      existingUser.name = dto.name?.trim() || existingUser.name;
      existingUser.phone = dto.phone || existingUser.phone;
      existingUser.passwordHash = passwordHash;
      existingUser.isActive = true;
      existingUser.deactivatedAt = null;
      savedUser = await this.usersRepository.save(existingUser);
      this.usersService.invalidateUserCache(savedUser.id);
    } else {
      const newUser = this.usersRepository.create({
        companyId: invite.companyId,
        email: invite.email,
        name: dto.name?.trim() || invite.email.split('@')[0],
        phone: dto.phone || undefined,
        role: invite.role,
        passwordHash,
        isActive: true,
      });
      savedUser = await this.usersRepository.save(newUser);
    }

    invite.usedAt = new Date();
    await this.invitesRepository.save(invite);

    return {
      success: true,
      message: 'Conta ativada com sucesso',
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
      },
    };
  }

  // ────────── PÚBLICO: REDEFINIR SENHA ──────────

  async resetPassword(dto: ResetPasswordDto) {
    if (!dto.password || dto.password.length < 8) {
      throw new BadRequestException('A senha deve ter no mínimo 8 caracteres');
    }

    const tokenHash = this.hashToken(dto.token);
    const invite = await this.invitesRepository.findOne({
      where: { tokenHash, usedAt: IsNull(), expiresAt: MoreThan(new Date()), type: 'reset' },
    });

    if (!invite) {
      throw new NotFoundException('Link de recuperação inválido ou expirado');
    }

    const user = await this.usersRepository.findOneBy({
      email: invite.email,
      companyId: invite.companyId,
    });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    user.passwordHash = await bcrypt.hash(dto.password, 10);
    await this.usersRepository.save(user);
    this.usersService.invalidateUserCache(user.id);

    invite.usedAt = new Date();
    await this.invitesRepository.save(invite);

    return {
      success: true,
      message: 'Senha redefinida com sucesso',
    };
  }
}
