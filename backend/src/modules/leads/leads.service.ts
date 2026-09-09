import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStage } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { MetaAdsService } from '../meta-ads/meta-ads.service';
import { Company } from '../companies/entities/company.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
    private metaAdsService: MetaAdsService,
  ) {}

  create(companyId: string, userId: string, dto: CreateLeadDto) {
    const lead = this.leadsRepository.create({
      ...dto,
      companyId,
      createdBy: userId,
    });
    return this.leadsRepository.save(lead);
  }

  findAll(companyId: string) {
    return this.leadsRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  findByStage(companyId: string, stage: LeadStage) {
    return this.leadsRepository.find({
      where: { companyId, stage },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string) {
    const lead = await this.leadsRepository.findOneBy({ id, companyId });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, companyId: string, dto: UpdateLeadDto) {
    const lead = await this.leadsRepository.findOneBy({ id, companyId });
    if (!lead) throw new NotFoundException('Lead not found');
    Object.assign(lead, dto);
    return this.leadsRepository.save(lead);
  }

  async updateStage(id: string, companyId: string, stage: LeadStage, userId: string) {
    const lead = await this.leadsRepository.findOneBy({ id, companyId });
    if (!lead) throw new NotFoundException('Lead not found');
    lead.stage = stage;
    const saved = await this.leadsRepository.save(lead);

    if (stage === LeadStage.CLOSED_WON) {
      const company = await this.companyRepository.findOneBy({ id: companyId });
      if (company && company.metaDatasetId && company.metaAccessToken) {
        // Disparar envio assíncrono para o Meta
        this.metaAdsService.sendPurchaseEvent(saved, company.metaDatasetId, company.metaAccessToken).catch(err => {
          console.error(`Erro ao disparar evento de compra para o Meta: ${err.message}`);
        });
      }
      
      // Criação automática da Obra
      try {
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        // 1. Pegar a última proposta enviada deste lead
        const { data: proposals } = await supabase
          .from('proposals')
          .select('id, client_name, client_cep, client_city, client_phone, client_email, system_power_kwp, module_qty, module_id, inverter_id, final_price, cost_modules, cost_inverter, cost_labor, cost_travel')
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
            client_phone: proposal?.client_phone || lead.phone,
            client_email: proposal?.client_email || lead.email,
            city: proposal?.client_city || lead.city,
            system_power_kwp: proposal?.system_power_kwp,
            module_qty: proposal?.module_qty,
            sale_price: proposal?.final_price,
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
             const checklistItems = templates.map(t => ({
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

  async remove(id: string, companyId: string) {
    const result = await this.leadsRepository.delete({ id, companyId });
    if (!result.affected) throw new NotFoundException('Lead not found');
  }

  getStats(companyId: string) {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .select('lead.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('lead.company_id = :companyId', { companyId })
      .groupBy('lead.stage')
      .getRawMany();
  }

  getConversionRate(companyId: string) {
    return this.leadsRepository
      .createQueryBuilder('lead')
      .select("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
      .addSelect('COUNT(*)', 'total')
      .where('lead.company_id = :companyId', { companyId })
      .getRawOne();
  }
}
