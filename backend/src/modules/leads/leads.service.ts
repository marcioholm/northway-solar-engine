import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStage } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private leadsRepository: Repository<Lead>,
    ) { }

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

    findOne(id: string) {
        return this.leadsRepository.findOneBy({ id });
    }

    async update(id: string, dto: UpdateLeadDto) {
        const lead = await this.leadsRepository.findOneBy({ id });
        if (!lead) throw new NotFoundException('Lead not found');
        Object.assign(lead, dto);
        return this.leadsRepository.save(lead);
    }

    async updateStage(id: string, stage: LeadStage, userId: string) {
        const lead = await this.leadsRepository.findOneBy({ id });
        if (!lead) throw new NotFoundException('Lead not found');
        lead.stage = stage;
        return this.leadsRepository.save(lead);
    }

    async remove(id: string) {
        const result = await this.leadsRepository.delete(id);
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
