import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { SolarEngineModule } from '../solar-engine/solar-engine.module';
import { SolarProjectModule } from '../solar-project/solar-project.module';

@Module({
  imports: [TypeOrmModule.forFeature([Proposal]), SolarEngineModule, SolarProjectModule],
  controllers: [ProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule { }
