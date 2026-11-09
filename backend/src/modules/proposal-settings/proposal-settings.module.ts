import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalSettings } from './entities/proposal-settings.entity';
import { ProposalSettingsService } from './proposal-settings.service';
import { ProposalSettingsController } from './proposal-settings.controller';
import { ImageOptimizerService } from './image-optimizer.service';
import { SupabaseModule } from '../../supabase/supabase.module';
import { Company } from '../companies/entities/company.entity';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalSettings, Company]),
    SupabaseModule,
  ],
  controllers: [ProposalSettingsController],
  providers: [ProposalSettingsService, ImageOptimizerService, UserThrottlerGuard],
  exports: [ProposalSettingsService, ImageOptimizerService],
})
export class ProposalSettingsModule {}
