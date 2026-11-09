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
import { Throttle } from '@nestjs/throttler';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';
import { clientIp } from '../../common/utils/client-ip.util';
import * as crypto from 'crypto';
import { ProposalTrackingService } from './proposal-tracking.service';
import { ProposalsService } from '../proposals/proposals.service';
import { TrackEventDto } from './dto/track-event.dto';
import { ProposalTrackingStatsDto } from './dto/tracking-stats.dto';
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('Proposal Tracking')
@Controller('proposals')
export class ProposalTrackingController {
  constructor(
    private readonly service: ProposalTrackingService,
    private readonly proposalsService: ProposalsService,
  ) {}

  @Post('/public/:token/tracking')
  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar evento de rastreamento (token público)' })
  async trackPublic(
    @Param('token') token: string,
    @Body() dto: TrackEventDto,
    @Req() req: any,
  ) {
    const proposal = await this.proposalsService.findByToken(token);
    if (!proposal) throw new NotFoundException('Proposal not found');

    const rawIp = clientIp(req);
    const salt = process.env.IP_HASH_SALT;
    const hashedIp =
      salt && rawIp
        ? crypto.createHash('sha256').update(`${rawIp}${salt}`).digest('hex').slice(0, 32)
        : null;

    const ua = req.headers?.['user-agent'] || '';
    return this.service.track(proposal.id, dto, hashedIp || undefined, ua);
  }

  @Get(':id/tracking/stats')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Obter estatísticas de rastreamento da proposta' })
  async stats(@Param('id') id: string, @Request() req): Promise<ProposalTrackingStatsDto> {
    const scope = scopeFor(req.user);
    await this.proposalsService.findOne(id, scope.companyId, scope.ownerUserId);
    return this.service.getStats(id, scope.companyId);
  }
}
