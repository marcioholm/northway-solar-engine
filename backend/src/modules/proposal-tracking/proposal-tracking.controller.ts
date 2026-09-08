import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProposalTrackingService } from './proposal-tracking.service';
import { ProposalsService } from '../proposals/proposals.service';
import { TrackEventDto } from './dto/track-event.dto';
import { ProposalTrackingStatsDto } from './dto/tracking-stats.dto';

@ApiTags('Proposal Tracking')
@Controller('proposals')
export class ProposalTrackingController {
  constructor(
    private readonly service: ProposalTrackingService,
    private readonly proposalsService: ProposalsService,
  ) {}

  @Post(':id/tracking')
  @ApiOperation({ summary: 'Registrar evento de rastreamento (id interno - legado)' })
  async track(
    @Param('id') id: string,
    @Body() dto: TrackEventDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers?.['x-forwarded-for'] || '';
    const ua = req.headers?.['user-agent'] || '';
    return this.service.track(id, dto, ip, ua);
  }

  @Post('/public/:token/tracking')
  @ApiOperation({ summary: 'Registrar evento de rastreamento (token público)' })
  async trackPublic(
    @Param('token') token: string,
    @Body() dto: TrackEventDto,
    @Req() req: any,
  ) {
    const proposal = await this.proposalsService.findByToken(token);
    if (!proposal) throw new NotFoundException('Proposal not found');

    const ip = req.ip || req.headers?.['x-forwarded-for'] || '';
    const ua = req.headers?.['user-agent'] || '';
    return this.service.track(proposal.id, dto, ip, ua);
  }

  @Get(':id/tracking/stats')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter estatísticas de rastreamento da proposta' })
  async stats(@Param('id') id: string, @Request() req): Promise<ProposalTrackingStatsDto> {
    return this.service.getStats(id, req.user.companyId);
  }
}
