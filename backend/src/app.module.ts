import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
      inject: [ConfigService],
    }),
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
