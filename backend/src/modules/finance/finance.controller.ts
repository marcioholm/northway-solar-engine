import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@Controller('finance')
@UseGuards(SupabaseAuthGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.financeService.getDashboardData(req.user.company_id);
  }
}
