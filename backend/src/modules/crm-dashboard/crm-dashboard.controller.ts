import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CrmDashboardService } from './crm-dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('crm-dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('crm-dashboard')
export class CrmDashboardController {
  constructor(private readonly dashboardService: CrmDashboardService) {}

  @Get()
  getDashboard(@Request() req) {
    return this.dashboardService.getDashboard(req.user.companyId);
  }

  @Get('sources')
  getSources(@Request() req) {
    return this.dashboardService.getSources(req.user.companyId);
  }
}
