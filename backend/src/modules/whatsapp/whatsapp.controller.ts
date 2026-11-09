import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EvolutionApiService } from './evolution-api.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('whatsapp')
@Controller('whatsapp')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
export class WhatsappController {
  constructor(private readonly evolutionApi: EvolutionApiService) {}

  @Post('instance')
  @ApiBearerAuth()
  async createInstance(@Request() req, @Body() body: { instanceName: string; apiUrl: string; apiKey: string }) {
    return this.evolutionApi.createInstance(
      req.user.companyId,
      body.instanceName,
      body.apiUrl,
      body.apiKey,
      req.user.userId,
    );
  }

  @Get('instance/:id/qrcode')
  @ApiBearerAuth()
  async getQrCode(@Param('id') id: string, @Request() req) {
    return this.evolutionApi.getQrCode(id, req.user.companyId);
  }
}
