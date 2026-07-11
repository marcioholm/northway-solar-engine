import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalTracking } from './entities/proposal-tracking.entity';
import { ProposalTrackingService } from './proposal-tracking.service';
import { ProposalTrackingController } from './proposal-tracking.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProposalTracking])],
  controllers: [ProposalTrackingController],
  providers: [ProposalTrackingService],
  exports: [ProposalTrackingService],
})
export class ProposalTrackingModule {}
