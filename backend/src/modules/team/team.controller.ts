import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { TeamService } from './team.service';
import { CreateInviteDto } from './dto/invite.dto';
import { UpdateMemberDto, ReassignMemberDto } from './dto/member.dto';

@ApiTags('Team')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('team')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar membros e convites da equipe' })
  getTeam(@Request() req) {
    return this.teamService.getTeam(req.user.companyId);
  }

  @Post('invites')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar e enviar convite para novo membro' })
  createInvite(@Request() req, @Body() dto: CreateInviteDto) {
    return this.teamService.createInvite(req.user.companyId, req.user.userId, dto);
  }

  @Post('invites/:id/resend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reenviar convite pendente' })
  resendInvite(@Request() req, @Param('id') id: string) {
    return this.teamService.resendInvite(req.user.companyId, id);
  }

  @Delete('invites/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Cancelar convite pendente' })
  deleteInvite(@Request() req, @Param('id') id: string) {
    return this.teamService.deleteInvite(req.user.companyId, id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Atualizar dados/perfil de membro da equipe' })
  updateMember(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.teamService.updateMember(req.user.companyId, id, req.user.userId, dto);
  }

  @Post(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar membro da equipe' })
  deactivateMember(@Request() req, @Param('id') id: string) {
    return this.teamService.deactivateMember(req.user.companyId, id, req.user.userId);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Desativar membro da equipe (patch)' })
  deactivateMemberPatch(@Request() req, @Param('id') id: string) {
    return this.teamService.deactivateMember(req.user.companyId, id, req.user.userId);
  }

  @Post(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reativar membro da equipe' })
  reactivateMember(@Request() req, @Param('id') id: string) {
    return this.teamService.reactivateMember(req.user.companyId, id);
  }

  @Patch(':id/reactivate')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Reativar membro da equipe (patch)' })
  reactivateMemberPatch(@Request() req, @Param('id') id: string) {
    return this.teamService.reactivateMember(req.user.companyId, id);
  }

  @Post(':id/password-reset')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Gerar link de redefinição de senha para membro' })
  passwordReset(@Request() req, @Param('id') id: string) {
    return this.teamService.generatePasswordReset(req.user.companyId, id, req.user.userId);
  }

  @Post(':id/reassign')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Reatribuir leads, projetos e propostas em massa' })
  reassignMember(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: ReassignMemberDto,
  ) {
    return this.teamService.reassignMemberData(req.user.companyId, id, dto);
  }
}
