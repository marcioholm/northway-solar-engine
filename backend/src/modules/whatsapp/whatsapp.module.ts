import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsappController } from './whatsapp.controller';
import { EvolutionApiService } from './evolution-api.service';
import { FollowUpCronService } from './follow-up-cron.service';
import { WhatsappInstance } from './entities/whatsapp-instance.entity';
import { FollowUpRule } from './entities/follow-up-rule.entity';
import { FollowUpLog } from './entities/follow-up-log.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { ProposalEvent } from '../proposals/entities/proposal-event.entity';
import { Lead } from '../leads/entities/lead.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsappInstance,
      FollowUpRule,
      FollowUpLog,
      Proposal,
      ProposalEvent,
      Lead,
    ]),
  ],
  controllers: [WhatsappController],
  providers: [EvolutionApiService, FollowUpCronService],
  exports: [EvolutionApiService],
})
export class WhatsappModule {}
