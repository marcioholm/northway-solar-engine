import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@Controller('intelligence')
@UseGuards(SupabaseAuthGuard)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.intelligenceService.getDashboardData(req.user.company_id);
  }
}
