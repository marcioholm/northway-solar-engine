import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProposalSettings } from './entities/proposal-settings.entity';
import { ProposalSettingsService } from './proposal-settings.service';
import { ProposalSettingsController } from './proposal-settings.controller';
import { SupabaseModule } from '../../supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProposalSettings]),
    SupabaseModule,
  ],
  controllers: [ProposalSettingsController],
  providers: [ProposalSettingsService],
  exports: [ProposalSettingsService],
})
export class ProposalSettingsModule {}
