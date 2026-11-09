import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { CrmDashboardService } from './crm-dashboard.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('crm-dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('crm-dashboard')
export class CrmDashboardController {
  constructor(private readonly dashboardService: CrmDashboardService) {}

  @Get()
  getDashboard(@Request() req) {
    const scope = scopeFor(req.user);
    return this.dashboardService.getDashboard(scope.companyId, scope.ownerUserId);
  }

  @Get('sources')
  getSources(@Request() req) {
    const scope = scopeFor(req.user);
    return this.dashboardService.getSources(scope.companyId, scope.ownerUserId);
  }
}
