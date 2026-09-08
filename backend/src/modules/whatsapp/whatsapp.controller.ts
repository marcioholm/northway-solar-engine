import { Controller, Post, Body, Get, Param, UseGuards, Request } from '@nestjs/common';
import { EvolutionApiService } from './evolution-api.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('whatsapp')
@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly evolutionApi: EvolutionApiService) {}

  @Post('instance')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  async getQrCode(@Param('id') id: string) {
    return this.evolutionApi.getQrCode(id);
  }
}
