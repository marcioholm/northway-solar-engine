import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ProposalsService } from './proposals.service';
import { ProposalSettingsService } from '../proposal-settings/proposal-settings.service';
import { ProposalTrackingService } from '../proposal-tracking/proposal-tracking.service';
import { resolveDestination } from './templates/qr-target';

@ApiTags('QR Tracking')
@Controller('q')
export class QrController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly proposalSettingsService: ProposalSettingsService,
    private readonly proposalTrackingService: ProposalTrackingService,
  ) {}

  @Get(':token')
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Redirecionamento rastreado do QR Code da proposta' })
  async handleQrRedirect(
    @Param('token') token: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const proposal = await this.proposalsService.findByToken(token);
    if (!proposal) {
      throw new NotFoundException('Proposta não encontrada');
    }

    const settings = await this.proposalSettingsService.findByCompanyId(
      proposal.companyId,
    );

    const projectData = (proposal.solarProject || {}) as any;
    const clientName = proposal.clientName || projectData.clientName || '';
    const consultantPhone =
      projectData.consultantPhone || (proposal as any).consultantPhone || '';
    const consultantName =
      projectData.consultantName || (proposal as any).consultantName || '';

    const publicBase =
      process.env.FRONTEND_URL?.replace(/\/?$/, '/proposta/') ||
      'https://northway-solar-engine.vercel.app/proposta/';

    const destination =
      resolveDestination(
        {
          publicToken: proposal.publicToken,
          client: { name: clientName },
          consultant: { name: consultantName, phone: consultantPhone },
        },
        settings.qr || { type: 'proposal', enabled: true },
        publicBase,
      ) || `${publicBase.replace(/\/?$/, '/')}${encodeURIComponent(proposal.publicToken)}?src=qr`;

    // Privacidade: NÃO grava IP (nem em hash). Apenas o tipo de dispositivo (mobile/desktop).
    const rawUa = (req.headers?.['user-agent'] as string) || '';
    const isMobile =
      /mobile|android|iphone|ipad|ipod|blackberry|opera mini|iemobile/i.test(
        rawUa,
      );
    const device = isMobile ? 'mobile' : 'desktop';

    try {
      await this.proposalTrackingService.track(
        proposal.id,
        {
          eventType: 'qr_scan',
          metadata: {
            destination: settings.qr?.type || 'proposal',
            device,
          },
        },
        undefined, // Sem IP gravado para proteção de privacidade
        device, // Apenas tipo de dispositivo simplificado
      );
    } catch {
      // Ignore tracking errors on redirect
    }

    return res.redirect(302, destination);
  }
}
