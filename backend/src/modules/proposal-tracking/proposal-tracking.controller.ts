import { Controller, Post, Get, Param, Body, Req, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProposalTrackingService } from './proposal-tracking.service';
import { TrackEventDto } from './dto/track-event.dto';
import { ProposalTrackingStatsDto } from './dto/tracking-stats.dto';

@ApiTags('Proposal Tracking')
@Controller('proposals/:id/tracking')
export class ProposalTrackingController {
  constructor(private readonly service: ProposalTrackingService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar evento de rastreamento (público)' })
  async track(@Param('id') id: string, @Body() dto: TrackEventDto, @Req() req: any) {
    const ip = req.ip || req.headers?.['x-forwarded-for'] || '';
    const ua = req.headers?.['user-agent'] || '';
    return this.service.track(id, dto, ip, ua);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter estatísticas de rastreamento da proposta' })
  async stats(@Param('id') id: string): Promise<ProposalTrackingStatsDto> {
    return this.service.getStats(id);
  }
}
