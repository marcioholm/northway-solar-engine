import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmDashboardController } from './crm-dashboard.controller';
import { CrmDashboardService } from './crm-dashboard.service';
import { Lead } from '../leads/entities/lead.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { Task } from '../tasks/entities/task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lead, Proposal, Task])],
  controllers: [CrmDashboardController],
  providers: [CrmDashboardService],
})
export class CrmDashboardModule {}
