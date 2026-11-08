import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from 'class-validator';
import * as crypto from 'crypto';

import { ProposalsService, TEMPLATE_VERSION } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { Proposal } from './entities/proposal.entity';
import { ProposalEvent } from './entities/proposal-event.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import { SolarEngineService } from '../solar-engine/solar-engine.service';
import { SolarProjectService } from '../solar-project/solar-project.service';
import { PricingEngineService } from '../pricing-engine/pricing-engine.service';
import { CompaniesService } from '../companies/companies.service';
import { LeadsService } from '../leads/leads.service';
import { ProposalSettingsService } from '../proposal-settings/proposal-settings.service';
import { InventoryService } from '../inventory/inventory.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { ProposalTrackingController } from '../proposal-tracking/proposal-tracking.controller';
import { ProposalTrackingService } from '../proposal-tracking/proposal-tracking.service';
import { TrackEventDto } from '../proposal-tracking/dto/track-event.dto';
import { ProposalTracking } from '../proposal-tracking/entities/proposal-tracking.entity';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';

describe('Proposta Confiável (Snapshots, Cache de PDF, Validade, Tracking LGPD)', () => {
  let proposalsService: ProposalsService;
  let proposalsController: ProposalsController;
  let trackingController: ProposalTrackingController;
  let trackingService: ProposalTrackingService;

  let mockProposalsRepo: any;
  let mockOptionsRepo: any;
  let mockTrackingRepo: any;
  let mockCompaniesService: any;
  let mockProposalSettingsService: any;
  let mockSupabaseService: any;
  let mockSolarProjectService: any;
  let mockPricingEngineService: any;
  let mockManager: any;

  beforeEach(async () => {
    mockManager = {
      getRepository: jest.fn().mockImplementation((entity) => {
        if (entity === ProposalOption) {
          return {
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn().mockImplementation((data) => ({ id: 'opt-' + Math.random(), ...data })),
            save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
          };
        }
        if (entity === Proposal) {
          return {
            save: jest.fn().mockImplementation((data) => Promise.resolve({ id: 'p1', ...data })),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
          };
        }
        return {};
      }),
    };

    mockProposalsRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ id: 'p1', ...p })),
      create: jest.fn().mockImplementation((p) => p),
      manager: {
        transaction: jest.fn().mockImplementation(async (cb) => cb(mockManager)),
      },
    };

    mockOptionsRepo = {
      find: jest.fn().mockResolvedValue([]),
    };

    mockTrackingRepo = {
      create: jest.fn().mockImplementation((e) => e),
      save: jest.fn().mockImplementation((e) => Promise.resolve({ id: 'track-1', ...e })),
    };

    mockCompaniesService = {
      findOne: jest.fn().mockResolvedValue({
        id: 'c1',
        name: 'Empresa Atual',
        logoUrl: 'https://storage/current-logo.png',
      }),
    };

    mockProposalSettingsService = {
      findByCompanyId: jest.fn().mockResolvedValue({
        primaryColor: '#CURRENT1',
        secondaryColor: '#CURRENT2',
        contact: { whatsapp: '11999999999' },
      }),
    };

    mockSupabaseService = {
      downloadFile: jest.fn(),
      uploadFile: jest.fn(),
    };

    mockSolarProjectService = {
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };

    mockPricingEngineService = {
      calculate: jest.fn().mockReturnValue({ finalPrice: 20000, appliedMarginPct: 20, profit: 4000 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalsController, ProposalTrackingController],
      providers: [
        ProposalsService,
        ProposalTrackingService,
        { provide: getRepositoryToken(Proposal), useValue: mockProposalsRepo },
        { provide: getRepositoryToken(ProposalEvent), useValue: {} },
        { provide: getRepositoryToken(ProposalOption), useValue: mockOptionsRepo },
        { provide: getRepositoryToken(ProposalTracking), useValue: mockTrackingRepo },
        { provide: SolarEngineService, useValue: {} },
        { provide: SolarProjectService, useValue: mockSolarProjectService },
        { provide: PricingEngineService, useValue: mockPricingEngineService },
        { provide: CompaniesService, useValue: mockCompaniesService },
        { provide: LeadsService, useValue: { findOne: jest.fn(), updateStage: jest.fn() } },
        { provide: ProposalSettingsService, useValue: mockProposalSettingsService },
        { provide: InventoryService, useValue: { findAllInverters: jest.fn().mockResolvedValue([]) } },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    })
      .overrideGuard(UserThrottlerGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    proposalsService = module.get<ProposalsService>(ProposalsService);
    proposalsController = module.get<ProposalsController>(ProposalsController);
    trackingController = module.get<ProposalTrackingController>(ProposalTrackingController);
    trackingService = module.get<ProposalTrackingService>(ProposalTrackingService);
  });

  describe('1. Snapshots imutáveis', () => {
    it('usa settingsSnapshot e companySnapshot quando presentes sem consultar dados atuais', async () => {
      const frozenSettings = {
        primaryColor: '#FROZEN1',
        secondaryColor: '#FROZEN2',
        aboutText: 'Texto congelado',
      };
      const frozenCompany = {
        id: 'c1',
        name: 'Empresa Congelada',
        logoUrl: 'https://storage/frozen-logo.png',
      };

      mockProposalsRepo.findOne.mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
        settingsSnapshot: frozenSettings,
        companySnapshot: frozenCompany,
        options: [],
      });

      const assembled = await proposalsService.assemble('p1', 'c1');

      expect(assembled.proposalSettings).toEqual(frozenSettings);
      expect(assembled.company).toEqual(frozenCompany);
      expect(mockCompaniesService.findOne).not.toHaveBeenCalled();
      expect(mockProposalSettingsService.findByCompanyId).not.toHaveBeenCalled();
    });

    it('faz fallback para dados atuais da empresa quando snapshots são nulos (propostas antigas)', async () => {
      mockProposalsRepo.findOne.mockResolvedValue({
        id: 'p-old',
        companyId: 'c1',
        settingsSnapshot: null,
        companySnapshot: null,
        options: [],
      });

      const assembled = await proposalsService.assemble('p-old', 'c1');

      expect(assembled.company?.name).toBe('Empresa Atual');
      expect((assembled.proposalSettings as any)?.primaryColor).toBe('#CURRENT1');
      expect(mockCompaniesService.findOne).toHaveBeenCalledWith('c1');
      expect(mockProposalSettingsService.findByCompanyId).toHaveBeenCalledWith('c1');
    });

    it('empresa com cardTax=5 e financeTax=10 mas sem proposal_settings.payment_defaults: cartao e financiamento ficam undefined', async () => {
      mockCompaniesService.findOne.mockResolvedValue({
        id: 'c1',
        name: 'Empresa Sem Defaults',
        cardTax: 5,
        financeTax: 10,
        cashDiscount: 3,
      });

      mockProposalSettingsService.findByCompanyId.mockResolvedValue({
        primaryColor: '#123456',
        paymentDefaults: undefined, // Sem defaults de parcelas configurados
      });

      const mockSolarProject = {
        id: 'proj-1',
        companyId: 'c1',
        pricingLaborCost: 2000,
        pricingEquipmentCost: 15000,
        consumptionMonthlyBill: 500,
        paymentCardInstallments: null,
        paymentFinanceInstallments: null,
        equipmentModules: [{ brand: 'Trina', model: '550W', power: 550, catalogId: 'm1' }],
        equipmentInverters: [{ brand: 'Deye', model: '5kW', powerKw: 5, catalogId: 'inv1' }],
        sizingPowerKwp: 5.5,
        sizingGenerationKwh: 650,
      };
      mockSolarProjectService.findOne.mockResolvedValue(mockSolarProject);
      mockPricingEngineService.calculate.mockReturnValue({ finalPrice: 22000, appliedMarginPct: 20, profit: 4400 });

      const createdProposal = await proposalsService.generate('proj-1', 'c1', 'user-1', {
        options: [{ position: 1, name: 'Kit 1' }],
      } as any);

      const payment = createdProposal.settings?.payment;
      expect(payment).toBeDefined();
      expect(payment.cashDiscountPct).toBe(3);
      // Sem parcelas inventadas (12 ou 60): devem ser undefined
      expect(payment.card).toBeUndefined();
      expect(payment.finance).toBeUndefined();
      expect(createdProposal.settingsSnapshot).toBeDefined();
      expect(createdProposal.companySnapshot).toBeDefined();
    });
  });

  describe('2. Cache do PDF no Supabase Storage', () => {
    it('cache hit: retorna buffer diretamente do storage sem chamar o renderizador do Chromium', async () => {
      const cachedPdfBuffer = Buffer.from('%PDF-1.4 cached test');
      mockSupabaseService.downloadFile.mockResolvedValue(cachedPdfBuffer);

      mockProposalsRepo.findOne.mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
        updatedAt: new Date('2026-01-01T12:00:00Z'),
        options: [],
      });

      const pdfRendererSpy = jest.spyOn((proposalsService as any).pdfRenderer, 'render');

      const result = await proposalsService.render('p1', 'c1', 'pdf');

      expect(result.content).toBe(cachedPdfBuffer);
      expect(result.mimeType).toBe('application/pdf');
      expect(pdfRendererSpy).not.toHaveBeenCalled();
      expect(mockSupabaseService.downloadFile).toHaveBeenCalledWith(
        'proposal-pdfs',
        expect.stringMatching(/^c1\/p1-[a-f0-9]{16}\.pdf$/),
      );
    });

    it('cache miss: gera via Chromium, salva no bucket proposal-pdfs e retorna o arquivo', async () => {
      mockSupabaseService.downloadFile.mockResolvedValue(null);
      const generatedBuffer = Buffer.from('%PDF-1.4 newly generated');
      const pdfRendererSpy = jest
        .spyOn((proposalsService as any).pdfRenderer, 'render')
        .mockResolvedValue({
          content: generatedBuffer,
          filename: 'proposal-p1.pdf',
          mimeType: 'application/pdf',
        });

      mockProposalsRepo.findOne.mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
        updatedAt: new Date('2026-01-01T12:00:00Z'),
        options: [],
      });

      const result = await proposalsService.render('p1', 'c1', 'pdf');

      expect(pdfRendererSpy).toHaveBeenCalled();
      expect(mockSupabaseService.uploadFile).toHaveBeenCalledWith(
        'proposal-pdfs',
        expect.stringMatching(/^c1\/p1-[a-f0-9]{16}\.pdf$/),
        generatedBuffer,
        'application/pdf',
      );
      expect(result.content).toEqual(generatedBuffer);
    });

    it('gerar PDF -> editar preco da opcao -> novo PDF NAO vem do cache e tem o preco novo', async () => {
      const initialDate = new Date('2026-01-01T10:00:00Z');
      let currentProposal: any = {
        id: 'p1',
        companyId: 'c1',
        solarProjectId: 'proj-1',
        updatedAt: initialDate,
        options: [
          { position: 1, name: 'Kit 1', finalPrice: 20000, recommended: true, isManualPrice: false },
        ],
      };

      mockProposalsRepo.findOne.mockImplementation(async () => ({ ...currentProposal }));
      mockOptionsRepo.find.mockImplementation(async () => [...currentProposal.options]);

      const storedFiles = new Map<string, Buffer>();
      mockSupabaseService.downloadFile.mockImplementation(async (_bucket: string, path: string) => {
        return storedFiles.get(path) || null;
      });
      mockSupabaseService.uploadFile.mockImplementation(async (_bucket: string, path: string, content: Buffer) => {
        storedFiles.set(path, content);
      });

      const pdfRendererSpy = jest
        .spyOn((proposalsService as any).pdfRenderer, 'render')
        .mockImplementation(async (data: any) => {
          const price = data.proposal?.options?.[0]?.finalPrice ?? 0;
          return {
            content: Buffer.from(`%PDF-price-${price}`),
            filename: 'proposal.pdf',
            mimeType: 'application/pdf',
          };
        });

      // 1. Gerar PDF inicial (preço 20000)
      const firstResult = await proposalsService.render('p1', 'c1', 'pdf');
      expect(firstResult.content.toString()).toBe('%PDF-price-20000');
      expect(pdfRendererSpy).toHaveBeenCalledTimes(1);

      // Segunda chamada com mesmo estado deve vir do cache
      const cachedResult = await proposalsService.render('p1', 'c1', 'pdf');
      expect(cachedResult.content.toString()).toBe('%PDF-price-20000');
      expect(pdfRendererSpy).toHaveBeenCalledTimes(1);

      // 2. Editar preço da opção via updateOptions
      mockSolarProjectService.findOne.mockResolvedValue({
        id: 'proj-1',
        sizingPowerKwp: 5,
        sizingGenerationKwh: 600,
        equipmentModules: [{ brand: 'B', model: 'M', power: 550 }],
        equipmentInverters: [{ brand: 'B', model: 'I', powerKw: 5 }],
      });

      const newUpdatedAt = new Date('2026-01-01T11:00:00Z');
      mockManager.getRepository = jest.fn().mockImplementation((entity) => {
        if (entity === ProposalOption) {
          return {
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn().mockImplementation((data) => ({ id: 'opt-new', ...data })),
            save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
          };
        }
        if (entity === Proposal) {
          return {
            update: jest.fn().mockImplementation(async (_where, updateData) => {
              currentProposal.updatedAt = updateData.updatedAt || newUpdatedAt;
              if (updateData.finalPrice != null) currentProposal.finalPrice = updateData.finalPrice;
            }),
          };
        }
        return {};
      });

      const updatedOptions = await proposalsService.updateOptions('p1', 'c1', {
        options: [
          { position: 1, name: 'Kit 1', finalPrice: 25000, isManualPrice: true },
        ],
      } as any);

      currentProposal.options = updatedOptions;
      currentProposal.updatedAt = newUpdatedAt;

      // 3. Gerar novo PDF
      const secondResult = await proposalsService.render('p1', 'c1', 'pdf');

      // NÃO veio do cache e tem o preço novo (25000)
      expect(secondResult.content.toString()).toBe('%PDF-price-25000');
      expect(pdfRendererSpy).toHaveBeenCalledTimes(2);
    });

    it('fallback gracioso: se o bucket proposal-pdfs não existir ou upload falhar, não quebra a geração', async () => {
      mockSupabaseService.downloadFile.mockRejectedValue(new Error('Bucket not found'));
      mockSupabaseService.uploadFile.mockRejectedValue(new Error('Bucket not found'));

      const generatedBuffer = Buffer.from('%PDF-1.4 fallback');
      jest.spyOn((proposalsService as any).pdfRenderer, 'render').mockResolvedValue({
        content: generatedBuffer,
        filename: 'proposal-p1.pdf',
        mimeType: 'application/pdf',
      });

      mockProposalsRepo.findOne.mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
        updatedAt: new Date('2026-01-01T12:00:00Z'),
        options: [],
      });

      const result = await proposalsService.render('p1', 'c1', 'pdf');
      expect(result.content).toEqual(generatedBuffer);
    });
  });

  describe('3. Validade aplicada (HTTP 410)', () => {
    it('isExpired retorna true para data no passado e false para data no futuro ou null', () => {
      const pastProposal = { expiresAt: new Date(Date.now() - 3600000) } as Proposal;
      const futureProposal = { expiresAt: new Date(Date.now() + 3600000) } as Proposal;
      const noExpiryProposal = { expiresAt: null } as any;

      expect(proposalsService.isExpired(pastProposal)).toBe(true);
      expect(proposalsService.isExpired(futureProposal)).toBe(false);
      expect(proposalsService.isExpired(noExpiryProposal)).toBe(false);
    });

    it('assertNotExpired lanca HttpException(410 Gone) reutilizavel com expired, companyName e whatsapp', async () => {
      const expiredProposal = {
        id: 'p-exp',
        companyId: 'c1',
        expiresAt: new Date(Date.now() - 3600000),
        companySnapshot: { name: 'Empresa do Snapshot' },
        settingsSnapshot: { contact: { whatsapp: '11988887777' } },
      } as Proposal;

      let thrownError: any;
      try {
        await proposalsService.assertNotExpired(expiredProposal);
      } catch (err) {
        thrownError = err;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError.getStatus()).toBe(HttpStatus.GONE);
      expect(thrownError.getResponse()).toMatchObject({
        expired: true,
        companyName: 'Empresa do Snapshot',
        whatsapp: '11988887777',
      });
    });

    it('rota pública GET /proposals/public/:token retorna 410 Gone quando proposta expirou', async () => {
      const expiredProposal = {
        id: 'p-exp',
        companyId: 'c1',
        publicToken: 'token-exp',
        expiresAt: new Date(Date.now() - 86400000),
      } as Proposal;

      jest.spyOn(proposalsService, 'findByToken').mockResolvedValue(expiredProposal);

      await expect(proposalsController.findOnePublic('token-exp')).rejects.toMatchObject({
        status: HttpStatus.GONE,
        response: expect.objectContaining({
          expired: true,
          companyName: 'Empresa Atual',
          whatsapp: '11999999999',
        }),
      });
    });

    it('rota pública GET /proposals/public/:token/pdf retorna 410 Gone quando proposta expirou', async () => {
      const expiredProposal = {
        id: 'p-exp',
        companyId: 'c1',
        publicToken: 'token-exp',
        expiresAt: new Date(Date.now() - 86400000),
      } as Proposal;

      jest.spyOn(proposalsService, 'findByToken').mockResolvedValue(expiredProposal);
      const res = { setHeader: jest.fn(), send: jest.fn() } as any;

      await expect(proposalsController.downloadPdfPublic('token-exp', res)).rejects.toMatchObject({
        status: HttpStatus.GONE,
        response: expect.objectContaining({
          expired: true,
        }),
      });
    });

    it('rota autenticada GET /proposals/:id/pdf abre normalmente mesmo se a proposta estiver expirada', async () => {
      const expiredProposal = {
        id: 'p-exp',
        companyId: 'c1',
        expiresAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        options: [],
      } as any;

      mockProposalsRepo.findOne.mockResolvedValue(expiredProposal);
      jest.spyOn((proposalsService as any).pdfRenderer, 'render').mockResolvedValue({
        content: Buffer.from('%PDF-1.4 ok'),
        filename: 'proposal-p-exp.pdf',
        mimeType: 'application/pdf',
      });

      const res = { setHeader: jest.fn(), send: jest.fn() } as any;
      const req = { user: { companyId: 'c1' } } as any;

      await proposalsController.downloadPdf('p-exp', req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.send).toHaveBeenCalledWith(Buffer.from('%PDF-1.4 ok'));
    });
  });

  describe('4. Tracking sanitizado (sem IP em claro, recusa accept, valida duration)', () => {
    it('TrackEventDto recusa evento accept na rota pública', async () => {
      const dto = new TrackEventDto();
      dto.eventType = 'accept' as any;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('eventType');
    });

    it('TrackEventDto aceita eventos válidos (view, download, whatsapp_click, qr_scan, section_view)', async () => {
      const dto = new TrackEventDto();
      dto.eventType = 'view';
      dto.duration = 120;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('TrackEventDto recusa duration negativo ou excessivo (> 86400)', async () => {
      const negativeDto = new TrackEventDto();
      negativeDto.eventType = 'view';
      negativeDto.duration = -10;

      const errorsNeg = await validate(negativeDto);
      expect(errorsNeg.length).toBeGreaterThan(0);

      const hugeDto = new TrackEventDto();
      hugeDto.eventType = 'view';
      hugeDto.duration = 100000;

      const errorsHuge = await validate(hugeDto);
      expect(errorsHuge.length).toBeGreaterThan(0);
    });

    it('salva hash SHA-256 do IP com salt e nunca o IP em claro', async () => {
      process.env.IP_HASH_SALT = 'secret-test-salt';
      const rawIp = '192.168.1.100';
      const expectedHash = crypto
        .createHash('sha256')
        .update(rawIp + process.env.IP_HASH_SALT)
        .digest('hex')
        .slice(0, 32);

      jest.spyOn(proposalsService, 'findByToken').mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
      } as Proposal);

      const req = { ip: rawIp, headers: { 'user-agent': 'Jest' } };
      const dto: TrackEventDto = { eventType: 'view', duration: 15 };

      await trackingController.trackPublic('token-1', dto, req);

      expect(mockTrackingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          proposalId: 'p1',
          eventType: 'view',
          ipAddress: expectedHash,
        }),
      );
      expect(mockTrackingRepo.create).not.toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: rawIp,
        }),
      );
    });

    it('salva ipAddress como null quando IP_HASH_SALT não estiver definido', async () => {
      delete process.env.IP_HASH_SALT;

      jest.spyOn(proposalsService, 'findByToken').mockResolvedValue({
        id: 'p1',
        companyId: 'c1',
      } as Proposal);

      const req = { ip: '192.168.1.100', headers: {} };
      const dto: TrackEventDto = { eventType: 'view' };

      await trackingController.trackPublic('token-1', dto, req);

      expect(mockTrackingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: null,
        }),
      );
    });
  });
});
