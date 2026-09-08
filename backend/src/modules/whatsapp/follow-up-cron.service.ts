import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, IsNull, In } from 'typeorm';
import { ProposalEvent } from '../proposals/entities/proposal-event.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Lead } from '../leads/entities/lead.entity';
import { FollowUpRule } from './entities/follow-up-rule.entity';
import { FollowUpLog } from './entities/follow-up-log.entity';
import { WhatsappInstance } from './entities/whatsapp-instance.entity';
import { EvolutionApiService } from './evolution-api.service';

@Injectable()
export class FollowUpCronService {
  private readonly logger = new Logger(FollowUpCronService.name);

  constructor(
    @InjectRepository(ProposalEvent)
    private readonly proposalEventsRepo: Repository<ProposalEvent>,
    @InjectRepository(Proposal)
    private readonly proposalsRepo: Repository<Proposal>,
    @InjectRepository(Lead)
    private readonly leadsRepo: Repository<Lead>,
    @InjectRepository(FollowUpRule)
    private readonly rulesRepo: Repository<FollowUpRule>,
    @InjectRepository(FollowUpLog)
    private readonly logsRepo: Repository<FollowUpLog>,
    @InjectRepository(WhatsappInstance)
    private readonly instanceRepo: Repository<WhatsappInstance>,
    private readonly evolutionApi: EvolutionApiService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async processFollowUps() {
    this.logger.log('Starting follow-up cron job processing...');
    
    // Validate business hours (8h to 18h, Mon-Sat)
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    
    // 0 = Sunday
    if (day === 0 || hour < 8 || hour >= 18) {
      this.logger.log('Outside business hours. Skipping follow-ups.');
      return;
    }

    const rules = await this.rulesRepo.find({ where: { isActive: true } });
    if (!rules.length) return;

    for (const rule of rules) {
      try {
        await this.processRule(rule);
      } catch (err: any) {
        this.logger.error(`Error processing rule ${rule.trigger}: ${err.message}`);
      }
    }
  }

  private async processRule(rule: FollowUpRule) {
    if (rule.trigger === 'hot_lead') {
      // Client opened proposal and spent > 30s in pricing
      const events = await this.proposalEventsRepo.find({
        where: { eventType: 'VIEW_PRICING', durationSeconds: MoreThan(30) },
      });
      for (const event of events) {
        await this.handleTrigger(rule, event.proposalId, false);
      }
    } else if (rule.trigger === 'opened_no_action') {
      // Client opened but spent < 10s
      const events = await this.proposalEventsRepo.find({
        where: { eventType: 'VIEW_PRICING' },
      });
      for (const event of events) {
        if (event.durationSeconds < 10) {
          await this.handleTrigger(rule, event.proposalId, false);
        }
      }
    } else if (rule.trigger === 'expiring_soon_seller' || rule.trigger === 'expiring_soon_client') {
      // 3 days to expire
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 3);
      
      const proposals = await this.proposalsRepo.createQueryBuilder('proposal')
        .where('proposal.expires_at IS NOT NULL')
        .andWhere('proposal.expires_at >= :now', { now: new Date() })
        .andWhere('proposal.expires_at <= :target', { target: targetDate })
        .getMany();

      for (const proposal of proposals) {
        const isClient = rule.trigger === 'expiring_soon_client';
        await this.handleTrigger(rule, proposal.id, isClient);
      }
    } else if (rule.trigger === 'expired_seller') {
      const proposals = await this.proposalsRepo.createQueryBuilder('proposal')
        .where('proposal.expires_at IS NOT NULL')
        .andWhere('proposal.expires_at < :now', { now: new Date() })
        .getMany();

      for (const proposal of proposals) {
        await this.handleTrigger(rule, proposal.id, false);
      }
    }
    // Implement very_interested and going_cold...
  }

  private async handleTrigger(rule: FollowUpRule, proposalId: string, isToClient: boolean) {
    const proposal = await this.proposalsRepo.findOne({ where: { id: proposalId } });
    if (!proposal) return;

    // Check if we already logged this trigger for this proposal
    const existingLog = await this.logsRepo.findOne({
      where: { proposalId, trigger: rule.trigger, isToClient },
    });
    if (existingLog) return; // Already sent

    const lead = await this.leadsRepo.findOne({ where: { id: proposal.leadId } });
    if (!lead || lead.stage === 'closed_won' || lead.stage === 'closed_lost') return;

    const message = rule.message
      .replace('{nome_cliente}', lead.name)
      .replace('{numero}', proposal.id.slice(0, 6).toUpperCase());

    const log = this.logsRepo.create({
      companyId: rule.companyId,
      leadId: lead.id,
      proposalId: proposal.id,
      trigger: rule.trigger,
      sellerId: lead.assignedTo,
      isToClient,
      status: 'queued',
    });
    await this.logsRepo.save(log);

    // Attempt to send
    try {
      // Find instance
      let instance = await this.instanceRepo.findOne({
        where: { sellerId: lead.assignedTo, companyId: rule.companyId },
      });
      if (!instance) {
        // Fallback to company instance
        instance = await this.instanceRepo.findOne({
          where: { sellerId: IsNull(), companyId: rule.companyId },
        });
      }

      if (instance) {
        const phone = isToClient ? lead.phone : instance.phoneNumber;
        if (phone) {
          await this.evolutionApi.sendMessage(instance.id, phone, message);
          log.status = 'sent';
          log.sentAt = new Date();
          await this.logsRepo.save(log);
        } else {
          throw new Error('No phone number destination found.');
        }
      } else {
        throw new Error('No Whatsapp instance configured.');
      }
    } catch (error: any) {
      log.status = 'failed';
      log.error = error.message;
      await this.logsRepo.save(log);
    }
  }
}
