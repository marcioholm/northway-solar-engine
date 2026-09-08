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
