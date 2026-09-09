import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { IrradiationModule } from './modules/irradiation/irradiation.module';
import { SolarEngineModule } from './modules/solar-engine/solar-engine.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { UsersModule } from './modules/users/users.module';
import { LeadsModule } from './modules/leads/leads.module';
import { TimelineModule } from './modules/timeline/timeline.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CrmDashboardModule } from './modules/crm-dashboard/crm-dashboard.module';
import { SupabaseModule } from './supabase/supabase.module';
import { SolarProjectModule } from './modules/solar-project/solar-project.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { PricingEngineModule } from './modules/pricing-engine/pricing-engine.module';
import { ProposalTrackingModule } from './modules/proposal-tracking/proposal-tracking.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { MetaAdsModule } from './modules/meta-ads/meta-ads.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { IntelligenceModule } from './modules/intelligence/intelligence.module';
import { FinanceModule } from './modules/finance/finance.module';
import { TeamsModule } from './modules/teams/teams.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: configService.get('NODE_ENV') !== 'production',
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    InventoryModule,
    IrradiationModule,
    SolarEngineModule,
    CompaniesModule,
    ProposalsModule,
    UsersModule,
    LeadsModule,
    TimelineModule,
    TasksModule,
    CrmDashboardModule,
    SupabaseModule,
    SolarProjectModule,
    CatalogModule,
    PricingEngineModule,
    ProposalTrackingModule,
    WhatsappModule,
    MetaAdsModule,
    ProjectsModule,
    IntelligenceModule,
    FinanceModule,
    TeamsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
