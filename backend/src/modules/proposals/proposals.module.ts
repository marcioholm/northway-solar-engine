import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalEvent } from './entities/proposal-event.entity';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { SolarEngineModule } from '../solar-engine/solar-engine.module';
import { SolarProjectModule } from '../solar-project/solar-project.module';
import { PricingEngineModule } from '../pricing-engine/pricing-engine.module';
import { CompaniesModule } from '../companies/companies.module';
import { LeadsModule } from '../leads/leads.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Proposal, ProposalEvent]),
    SolarEngineModule,
    SolarProjectModule,
    PricingEngineModule,
    CompaniesModule,
    LeadsModule,
  ],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
