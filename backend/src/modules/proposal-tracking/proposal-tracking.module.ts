import { Module } from '@nestjs/common';
import { ProposalsModule } from '../proposals/proposals.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalTracking } from './entities/proposal-tracking.entity';
import { ProposalTrackingService } from './proposal-tracking.service';
import { ProposalTrackingController } from './proposal-tracking.controller';

import { Proposal } from '../proposals/entities/proposal.entity';

@Module({
  imports: [
    ProposalsModule,TypeOrmModule.forFeature([ProposalTracking, Proposal])],
  controllers: [ProposalTrackingController],
  providers: [ProposalTrackingService],
  exports: [ProposalTrackingService],
})
export class ProposalTrackingModule {}
