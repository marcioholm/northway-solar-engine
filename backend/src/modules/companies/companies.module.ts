import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { Company } from './entities/company.entity';
import { ProposalSettingsModule } from '../proposal-settings/proposal-settings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company]),
    ProposalSettingsModule,
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService],
})
export class CompaniesModule {}
