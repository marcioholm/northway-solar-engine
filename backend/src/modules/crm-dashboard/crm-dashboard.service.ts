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
  ) {}

  async getDashboard(companyId: string, ownerUserId?: string) {
    const leadWhere: any = { companyId };
    const proposalWhere: any = { companyId };
    if (ownerUserId) {
      leadWhere.assignedTo = ownerUserId;
      proposalWhere.ownerUserId = ownerUserId;
    }

    const totalLeads = await this.leadsRepository.countBy(leadWhere);
    const newLeads = await this.leadsRepository.countBy({
      ...leadWhere,
      stage: LeadStage.NEW,
    });
    const wonLeads = await this.leadsRepository.countBy({
      ...leadWhere,
      stage: LeadStage.CLOSED_WON,
    });
    const proposals = await this.proposalsRepository.countBy(proposalWhere);

    const convBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .select("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
      .addSelect('COUNT(*)', 'total')
      .where('lead.company_id = :companyId', { companyId });
    if (ownerUserId) {
      convBuilder.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }
    const conversionResult = await convBuilder.getRawOne();

    const conversionRate =
      conversionResult?.total > 0
        ? (Number(conversionResult.won) / Number(conversionResult.total)) * 100
        : 0;

    const avgTicketBuilder = this.proposalsRepository
      .createQueryBuilder('proposal')
      .select('AVG(proposal.final_price)', 'avg')
      .where('proposal.company_id = :companyId', { companyId });
    if (ownerUserId) {
      avgTicketBuilder.andWhere('proposal.owner_user_id = :ownerUserId', { ownerUserId });
    }
    const avgTicket = await avgTicketBuilder.getRawOne();

    const pendingTasks = ownerUserId
      ? await this.tasksRepository.count({
          where: [
            { companyId, status: TaskStatus.PENDING, assignedTo: ownerUserId },
            { companyId, status: TaskStatus.PENDING, createdBy: ownerUserId },
          ],
        })
      : await this.tasksRepository.countBy({
          companyId,
          status: TaskStatus.PENDING,
        });

    const stageBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .select('lead.stage', 'stage')
      .addSelect('COUNT(*)', 'count')
      .where('lead.company_id = :companyId', { companyId });
    if (ownerUserId) {
      stageBuilder.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }
    const leadsByStage = await stageBuilder
      .groupBy('lead.stage')
      .getRawMany();

    const topSellersBuilder = this.leadsRepository
      .createQueryBuilder('lead')
      .select('lead.assigned_to', 'userId')
      .addSelect("COUNT(CASE WHEN lead.stage = 'closed_won' THEN 1 END)", 'won')
      .addSelect('COUNT(*)', 'total')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.assigned_to IS NOT NULL');
    if (ownerUserId) {
      topSellersBuilder.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }
    const topSellers = await topSellersBuilder
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

  async getSources(companyId: string, ownerUserId?: string) {
    const qb = this.leadsRepository
      .createQueryBuilder('lead')
      .select('lead.source', 'source')
      .addSelect('COUNT(*)', 'count')
      .where('lead.company_id = :companyId', { companyId })
      .andWhere('lead.source IS NOT NULL');
    if (ownerUserId) {
      qb.andWhere('lead.assigned_to = :ownerUserId', { ownerUserId });
    }
    return qb
      .groupBy('lead.source')
      .orderBy('count', 'DESC')
      .getRawMany();
  }
}
