import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStage } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { MetaAdsService } from '../meta-ads/meta-ads.service';
import { Company } from '../companies/entities/company.entity';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private metaAdsService: MetaAdsService,
    private supabaseService: SupabaseService,
  ) {}

  create(
    companyId: string,
    userId: string,
    dto: CreateLeadDto,
    role?: UserRole | string,
  ) {
    const assignedTo =
      dto.assignedTo || (role === UserRole.SELLER ? userId : undefined);

    const lead = this.leadsRepository.create({
      ...dto,
      companyId,
      createdBy: userId,
      assignedTo,
    });
    return this.leadsRepository.save(lead);
  }

  findAll(companyId: string, ownerUserId?: string) {
    const where: any = { companyId };
    if (ownerUserId) {
      where.assignedTo = ownerUserId;
    }
    return this.leadsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  findByStage(companyId: string, stage: LeadStage, ownerUserId?: string) {
    const where: any = { companyId, stage };
    if (ownerUserId) {
      where.assignedTo = ownerUserId;
    }
    return this.leadsRepository.find({
      where,
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string, ownerUserId?: string) {
    const where: any = { id, companyId };
    if (ownerUserId) {
      where.assignedTo = ownerUserId;
    }
    const lead = await this.leadsRepository.findOneBy(where);
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateLeadDto,
    ownerUserId?: string,
  ) {
    const lead = await this.findOne(id, companyId, ownerUserId);

    // Se o usuário for seller, não pode alterar o assignedTo
    if (ownerUserId && dto.assignedTo && dto.assignedTo !== ownerUserId) {
      delete dto.assignedTo;
    }

    Object.assign(lead, dto);
    return this.leadsRepository.save(lead);
  }

  async updateStage(
    id: string,
    companyId: string,
    stage: LeadStage,
    userId: string,
    ownerUserId?: string,
  ) {
    const lead = await this.findOne(id, companyId, ownerUserId);
    lead.stage = stage;
    const saved = await this.leadsRepository.save(lead);

    if (stage === LeadStage.CLOSED_WON) {
      const company = await this.companyRepository.findOneBy({ id: companyId });
      if (company && company.metaDatasetId && company.metaAccessToken) {
        this.metaAdsService
          .sendPurchaseEvent(saved, company.metaDatasetId, company.metaAccessToken)
          .catch((err) => {
            console.error(
              `Erro ao disparar evento de compra para o Meta: ${err.message}`,
            );
          });
      }

      // Criação automática da Obra
      try {
        const supabase = this.supabaseService.getClient();

        // 1. Pegar a última proposta enviada deste lead
        const { data: proposals } = await supabase
          .from('proposals')
          .select(
            'id, client_name, client_city, system_power_kwp, module_qty, final_price, subtotal',
          )
          .eq('lead_id', id)
          .order('created_at', { ascending: false })
          .limit(1);

        const proposal = proposals?.[0];

        // 2. Inserir em projects
        const { data: project, error: insertError } = await supabase
          .from('projects')
          .insert({
            company_id: companyId,
            lead_id: id,
            proposal_id: proposal?.id,
            client_name: proposal?.client_name || lead.name,
            client_phone: lead.phone,
            client_email: lead.email,
            city: proposal?.client_city || lead.city,
            system_power_kwp: proposal?.system_power_kwp,
            module_qty: proposal?.module_qty,
            sale_price: proposal?.final_price,
            total_cost: proposal?.subtotal,
            sale_date: new Date().toISOString().split('T')[0],
            status: 'waiting_material',
          })
          .select('id')
          .single();

        if (insertError) {
          console.error('Erro ao criar projeto:', insertError);
        } else if (project) {
          // 3. Copiar items do checklist_templates da empresa
          const { data: templates } = await supabase
            .from('checklist_templates')
            .select('*')
            .eq('company_id', companyId);

          if (templates && templates.length > 0) {
            const checklistItems = templates.map((t) => ({
              project_id: project.id,
              stage: t.stage,
              item_label: t.item_label,
              photo_required: t.photo_required,
              sort_order: t.sort_order,
            }));
            await supabase.from('project_checklist').insert(checklistItems);
          }
        }
      } catch (err) {
        console.error('Falha ao instanciar obra:', err);
      }
    }

    return saved;
  }

  async remove(id: string, companyId: string, ownerUserId?: string) {
    const lead = await this.findOne(id, companyId, ownerUserId);
    await this.leadsRepository.remove(lead);
  }

  getStats(companyId: string, ownerUserId?: string) {
    const qb = this.leadsRepository
      .createQueryBuilder('lead')
      .select('lead.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('lead.company_id = :companyId', { companyId });

    if (ownerUserId) {
      qb.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }

    return qb.groupBy('lead.stage').getRawMany();
  }

  getConversionRate(companyId: string, ownerUserId?: string) {
    const qb = this.leadsRepository
      .createQueryBuilder('lead')
      .select("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
      .addSelect('COUNT(*)', 'total')
      .where('lead.company_id = :companyId', { companyId });

    if (ownerUserId) {
      qb.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }

    return qb.getRawOne();
  }
}
