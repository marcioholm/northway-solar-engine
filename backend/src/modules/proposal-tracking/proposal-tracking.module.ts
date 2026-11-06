import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalsModule } from '../proposals/proposals.module';
import { ProposalSettingsModule } from '../proposal-settings/proposal-settings.module';
import { ProposalTracking } from './entities/proposal-tracking.entity';
import { ProposalTrackingService } from './proposal-tracking.service';
import { ProposalTrackingController } from './proposal-tracking.controller';
import { QrController } from '../proposals/qr.controller';
import { Proposal } from '../proposals/entities/proposal.entity';

@Module({
  imports: [
    ProposalsModule,
    ProposalSettingsModule,
    TypeOrmModule.forFeature([ProposalTracking, Proposal]),
  ],
  controllers: [ProposalTrackingController, QrController],
  providers: [ProposalTrackingService],
  exports: [ProposalTrackingService],
})
export class ProposalTrackingModule {}
