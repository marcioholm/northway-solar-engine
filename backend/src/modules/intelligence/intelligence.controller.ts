import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('intelligence')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPERADMIN)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Get('dashboard')
  async getDashboard(@Request() req) {
    return this.intelligenceService.getDashboardData(req.user.companyId);
  }
}
