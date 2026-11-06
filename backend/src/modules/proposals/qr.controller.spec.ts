import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { QrController } from './qr.controller';
import { ProposalsService } from './proposals.service';
import { ProposalSettingsService } from '../proposal-settings/proposal-settings.service';
import { ProposalTrackingService } from '../proposal-tracking/proposal-tracking.service';

describe('QrController', () => {
  let controller: QrController;
  let proposalsService: { findByToken: jest.Mock };
  let proposalSettingsService: { findByCompanyId: jest.Mock };
  let proposalTrackingService: { track: jest.Mock };

  beforeEach(async () => {
    proposalsService = {
      findByToken: jest.fn(),
    };
    proposalSettingsService = {
      findByCompanyId: jest.fn(),
    };
    proposalTrackingService = {
      track: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrController],
      providers: [
        { provide: ProposalsService, useValue: proposalsService },
        { provide: ProposalSettingsService, useValue: proposalSettingsService },
        { provide: ProposalTrackingService, useValue: proposalTrackingService },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<QrController>(QrController);
  });

  it('throws NotFoundException if proposal token is invalid', async () => {
    proposalsService.findByToken!.mockResolvedValue(null);
    const mockRes = { redirect: jest.fn() } as any;

    await expect(
      controller.handleQrRedirect('invalid-token', {} as any, mockRes),
    ).rejects.toThrow(NotFoundException);
  });

  it('redirects with 302 and tracks qr_scan event with privacy (no IP, device only)', async () => {
    const mockProposal: any = {
      id: 'p-1',
      companyId: 'c-1',
      publicToken: 'tok-123',
      clientName: 'Cliente Alpha',
      solarProject: {},
    };
    proposalsService.findByToken.mockResolvedValue(mockProposal);
    proposalSettingsService.findByCompanyId.mockResolvedValue({
      qr: { enabled: true, type: 'proposal' },
    } as any);

    const mockReq = {
      ip: '127.0.0.1',
      headers: {
        'x-forwarded-for': '203.0.113.195',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      },
    } as any;
    const mockRes = { redirect: jest.fn() } as any;

    await controller.handleQrRedirect('tok-123', mockReq, mockRes);

    // Deve salvar metadata com destino e device, e NUNCA salvar IP
    expect(proposalTrackingService.track).toHaveBeenCalledWith(
      'p-1',
      expect.objectContaining({
        eventType: 'qr_scan',
        metadata: {
          destination: 'proposal',
          device: 'mobile',
        },
      }),
      undefined, // IP nunca registrado
      'mobile', // userAgent simplificado para device
    );

    expect(mockRes.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('/proposta/tok-123?src=qr'),
    );
  });

  it('consultor sem telefone + empresa com WhatsApp redireciona para o WhatsApp da empresa', async () => {
    const mockProposal: any = {
      id: 'p-2',
      companyId: 'c-2',
      publicToken: 'tok-consultant',
      clientName: 'Cliente Beta',
      solarProject: {},
    };
    proposalsService.findByToken.mockResolvedValue(mockProposal);
    proposalSettingsService.findByCompanyId.mockResolvedValue({
      qr: { enabled: true, type: 'consultant' },
      contact: { whatsapp: '11 98888-7777' },
    } as any);

    const mockReq = {
      headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    } as any;
    const mockRes = { redirect: jest.fn() } as any;

    await controller.handleQrRedirect('tok-consultant', mockReq, mockRes);

    expect(mockRes.redirect).toHaveBeenCalledWith(
      302,
      expect.stringContaining('https://wa.me/5511988887777'),
    );
  });
});
