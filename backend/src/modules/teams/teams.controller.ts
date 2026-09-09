import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@Controller('teams')
@UseGuards(SupabaseAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.teamsService.findAll(req.user.company_id);
  }
}
