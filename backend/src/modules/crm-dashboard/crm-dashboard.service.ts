import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead, LeadStage } from '../leads/entities/lead.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Task, TaskStatus } from '../tasks/entities/task.entity';

@Injectable()
export class CrmDashboardService {
    constructor(
        @InjectRepository(Lead)
        private leadsRepository: Repository<Lead>,
        @InjectRepository(Proposal)
        private proposalsRepository: Repository<Proposal>,
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    async getDashboard(companyId: string) {
        const totalLeads = await this.leadsRepository.countBy({ companyId });
        const newLeads = await this.leadsRepository.countBy({ companyId, stage: LeadStage.NEW });
        const wonLeads = await this.leadsRepository.countBy({ companyId, stage: LeadStage.CLOSED_WON });
        const proposals = await this.proposalsRepository.countBy({ companyId });

        const conversionResult = await this.leadsRepository
            .createQueryBuilder('lead')
            .select("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
            .addSelect('COUNT(*)', 'total')
            .where('lead.company_id = :companyId', { companyId })
            .getRawOne();

        const conversionRate = conversionResult?.total > 0
            ? (Number(conversionResult.won) / Number(conversionResult.total)) * 100
            : 0;

        const avgTicket = await this.proposalsRepository
            .createQueryBuilder('proposal')
            .select('AVG(proposal.final_price)', 'avg')
            .where('proposal.company_id = :companyId', { companyId })
            .getRawOne();

        const pendingTasks = await this.tasksRepository.countBy({ companyId, status: TaskStatus.PENDING });

        const leadsByStage = await this.leadsRepository
            .createQueryBuilder('lead')
            .select('lead.stage', 'stage')
            .addSelect('COUNT(*)', 'count')
            .where('lead.company_id = :companyId', { companyId })
            .groupBy('lead.stage')
            .getRawMany();

        const topSellers = await this.leadsRepository
            .createQueryBuilder('lead')
            .select('lead.assigned_to', 'userId')
            .addSelect("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
            .addSelect('COUNT(*)', 'total')
            .where('lead.company_id = :companyId', { companyId })
            .andWhere('lead.assigned_to IS NOT NULL')
            .groupBy('lead.assigned_to')
            .orderBy('won', 'DESC')
            .limit(5)
            .getRawMany();

        return {
            totalLeads,
            newLeads,
            wonLeads,
            proposals,
            conversionRate: Math.round(conversionRate * 100) / 100,
            avgTicket: Number(avgTicket?.avg) || 0,
            pendingTasks,
            leadsByStage,
            topSellers,
        };
    }

    async getSources(companyId: string) {
        return this.leadsRepository
            .createQueryBuilder('lead')
            .select('lead.source', 'source')
            .addSelect('COUNT(*)', 'count')
            .where('lead.company_id = :companyId', { companyId })
            .andWhere('lead.source IS NOT NULL')
            .groupBy('lead.source')
            .orderBy('count', 'DESC')
            .getRawMany();
    }
}
