import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInvite } from './entities/user-invite.entity';
import { User } from '../users/entities/user.entity';
import { Lead } from '../leads/entities/lead.entity';
import { SolarProject } from '../solar-project/entities/solar-project.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserInvite, User, Lead, SolarProject, Proposal]),
    UsersModule,
    CompaniesModule,
  ],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
