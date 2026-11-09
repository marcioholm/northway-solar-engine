import {
  PublicProposalView,
  toPublicProposalView,
} from './renderers/public-proposal.view';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalEvent } from './entities/proposal-event.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import {
  GenerateProposalDto,
  ProposalOptionDto,
  UpdateProposalOptionsDto,
} from './dto/proposal-option.dto';
import { calculateProportionalGeneration } from './utils/payment-calculator';
import { SolarEngineService } from '../solar-engine/solar-engine.service';
import { SolarProjectService } from '../solar-project/solar-project.service';
import { PricingEngineService } from '../pricing-engine/pricing-engine.service';
import { CompaniesService } from '../companies/companies.service';
import { LeadsService } from '../leads/leads.service';
import { ProposalSettingsService } from '../proposal-settings/proposal-settings.service';
import { InventoryService } from '../inventory/inventory.service';
import {
  calculateScenarios,
  DEFAULT_FUTURE_LOADS,
  normalizeSizingRules,
  SelectedFutureLoad,
  SizingRules,
  validateAndEnrichFutureLoads,
} from './utils/scenario-calculator';
import { LeadStage } from '../leads/entities/lead.entity';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { PricingInputDto } from '../pricing-engine/dto/pricing-input.dto';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { ProposalHtmlRenderer } from './renderers/proposal-html.renderer';
import { ProposalWebRenderer } from './renderers/proposal-web.renderer';
import { ProposalPdfRenderer } from './renderers/proposal-pdf.renderer';
import {
  ProposalAssembledData,
  RenderOutput,
} from './renderers/proposal-renderer.interface';
import { ProposalSettings } from '../proposal-settings/entities/proposal-settings.entity';
import { Company } from '../companies/entities/company.entity';
import { SupabaseService } from '../../supabase/supabase.service';

import * as crypto from 'crypto';

export const TEMPLATE_VERSION = 'v1.0';

@Injectable()
export class ProposalsService {
  private readonly logger = new Logger(ProposalsService.name);
  private readonly htmlRenderer = new ProposalHtmlRenderer();
  private readonly webRenderer = new ProposalWebRenderer();
  private readonly pdfRenderer = new ProposalPdfRenderer(this.htmlRenderer);

  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(ProposalEvent)
    private proposalEventsRepository: Repository<ProposalEvent>,
    @InjectRepository(ProposalOption)
    private proposalOptionsRepository: Repository<ProposalOption>,
    private solarEngineService: SolarEngineService,
    private solarProjectService: SolarProjectService,
    private pricingEngineService: PricingEngineService,
    private companiesService: CompaniesService,
    private leadsService: LeadsService,
    private proposalSettingsService: ProposalSettingsService,
    private inventoryService: InventoryService,
    @Optional() private supabaseService?: SupabaseService,
    @Optional() private configService?: ConfigService,
  ) { }

  // ────────── TRACKING ──────────

  async getEvents(proposalId: string) {
    return this.proposalEventsRepository.find({
      where: { proposalId },
      order: { createdAt: 'DESC' },
    });
  }

  isExpired(proposal: Proposal): boolean {
    if (!proposal.expiresAt) return false;
    return new Date(proposal.expiresAt).getTime() < Date.now();
  }

  async getExpiredException(proposal: Proposal): Promise<HttpException> {
    const companyName =
      proposal.companySnapshot?.name ||
      (proposal.companyId
        ? (await this.companiesService.findOne(proposal.companyId))?.name
        : 'Empresa');
    const settings =
      (proposal.settingsSnapshot as ProposalSettings) ||
      (proposal.companyId
        ? await this.proposalSettingsService.findByCompanyId(proposal.companyId)
        : null);
    const whatsapp = settings?.contact?.whatsapp || '';
    const formattedDate = proposal.expiresAt
      ? new Date(proposal.expiresAt).toLocaleDateString('pt-BR')
      : '';
    return new HttpException(
      {
        statusCode: HttpStatus.GONE,
        message: `Esta proposta expirou${formattedDate ? ' em ' + formattedDate : ''}. Entre em contato para uma versão atualizada.`,
        expired: true,
        companyName,
        whatsapp,
      },
      HttpStatus.GONE,
    );
  }

  async assertNotExpired(proposal: Proposal): Promise<void> {
    if (this.isExpired(proposal)) {
      throw await this.getExpiredException(proposal);
    }
  }

  async getPublicView(proposal: Proposal): Promise<PublicProposalView> {
    const { content } = await this.render(
      proposal.id,
      proposal.companyId,
      'web',
    );
    return toPublicProposalView(JSON.parse(content as string), proposal);
  }

  // ────────── ASSEMBLER ──────────

  async assemble(proposalId: string, companyId: string): Promise<ProposalAssembledData> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id: proposalId, companyId },
      relations: ['solarProject', 'company', 'quote', 'quote.items'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const company =
      (proposal.companySnapshot as Company) ??
      proposal.company ??
      (proposal.companyId
        ? await this.companiesService.findOne(proposal.companyId)
        : undefined) ??
      undefined;

    const project = proposal.solarProject;
    const quote = proposal.quote;

    if (project && quote?.items) {
      if (!project.equipmentModules || project.equipmentModules.length === 0) {
        project.equipmentModules = quote.items
          .filter((item) => item.productType === 'module')
          .map((item) => ({
            brand: item.productBrand,
            model: item.productModel,
            qty: item.quantity,
          })) as any;
      }
      if (!project.equipmentInverters || project.equipmentInverters.length === 0) {
        project.equipmentInverters = quote.items
          .filter((item) => item.productType === 'inverter')
          .map((item) => ({
            brand: item.productBrand,
            model: item.productModel,
            qty: item.quantity,
          })) as any;
      }
    }

    const proposalSettings =
      (proposal.settingsSnapshot as ProposalSettings) ??
      (proposal.companyId
        ? await this.proposalSettingsService.findByCompanyId(proposal.companyId)
        : undefined);

    const options = await this.proposalOptionsRepository.find({
      where: { proposalId: proposal.id, companyId },
      order: { position: 'ASC' },
    });
    proposal.options = options;

    return {
      proposal,
      project,
      quote,
      company,
      proposalSettings,
      consultantName: project?.consultantName || undefined,
      consultantPhone: undefined,
    };
  }

  // ────────── RENDERER ──────────

  async render(
    proposalId: string,
    companyId: string,
    format: 'html' | 'pdf' | 'web' = 'html',
  ): Promise<RenderOutput> {
    const data = await this.assemble(proposalId, companyId);

    if (format === 'pdf') {
      const updatedAtStr =
        data.proposal.updatedAt instanceof Date
          ? data.proposal.updatedAt.toISOString()
          : data.proposal.createdAt instanceof Date
            ? data.proposal.createdAt.toISOString()
            : '';
      const stage = data.proposal.stage || '';
      const expiresAt = data.proposal.expiresAt
        ? new Date(data.proposal.expiresAt).toISOString()
        : '';
      const optionsHash = (data.proposal.options || [])
        .map(
          (o) =>
            `${o.id || o.position}:${o.finalPrice}:${o.name}:${o.imageUrl || ''}:${o.systemPowerKwp}:${o.isManualPrice}`,
        )
        .join('|');
      const hashInput = `${updatedAtStr}-${stage}-${expiresAt}-${optionsHash}-${TEMPLATE_VERSION}`;
      const key = crypto
        .createHash('sha256')
        .update(hashInput)
        .digest('hex')
        .slice(0, 16);
      const cachePath = `${companyId}/${proposalId}-${key}.pdf`;

      if (this.supabaseService) {
        try {
          const cached = await this.supabaseService.downloadFile(
            'proposal-pdfs',
            cachePath,
          );
          if (cached) {
            return {
              content: cached,
              filename: `proposal-${proposalId}.pdf`,
              mimeType: 'application/pdf',
            };
          }
        } catch {
          // ignore cache read failure
        }
      }

      const result = await this.pdfRenderer.render(data);

      if (this.supabaseService && Buffer.isBuffer(result.content)) {
        try {
          await this.supabaseService.uploadFile(
            'proposal-pdfs',
            cachePath,
            result.content,
            'application/pdf',
          );
        } catch (err: any) {
          this.logger.warn(
            `PDF cache upload skipped/failed: ${err?.message || err}`,
          );
        }
      }

      return result;
    }

    switch (format) {
      case 'web':
        return this.webRenderer.render(data);
      default:
        return this.htmlRenderer.render(data);
    }
  }

  // ────────── NEW GENERATE (no calculations) ──────────

  async generate(
    projectId: string,
    companyId: string,
    userId: string,
    dto?: GenerateProposalDto,
  ): Promise<Proposal> {
    if (dto?.options && dto.options.length > 3) {
      throw new BadRequestException('A proposta pode ter no máximo 3 opções de kit');
    }

    // 1. Load project with quotes
    const project = await this.solarProjectService.findOne(projectId, companyId);

    // 2. Find selected quote
    const selectedQuote = project.quotes?.find((q) => q.selected);

    // 3. Build pricing input from project data and run engine
    const pricingInput = new PricingInputDto();
    pricingInput.equipmentCost = project.pricingEquipmentCost || 0;
    pricingInput.costProject = project.pricingProjectCost || 0;
    pricingInput.costArt = project.pricingArtCost || 0;
    pricingInput.costInstallation =
      project.pricingInstallationCost || project.pricingLaborCost || 0;
    pricingInput.costHotel = project.pricingHotelCost || 0;
    pricingInput.costFreight = project.pricingFreightCost || 0;
    pricingInput.costFood = project.pricingFoodCost || 0;
    pricingInput.costTravel = project.pricingTravelCost || 0;
    pricingInput.costToll = project.pricingTollCost || 0;
    pricingInput.costCommission = project.pricingCommission || 0;
    pricingInput.costCrane = project.pricingCraneCost || 0;
    pricingInput.costThirdParties = project.pricingThirdPartiesCost || 0;
    pricingInput.costAdmin = project.pricingAdminCost || 0;
    pricingInput.costTaxes = project.pricingTaxes || 0;
    pricingInput.costOther = project.pricingOtherCost || 0;
    pricingInput.marginPct = project.pricingMarginPct || 0;
    pricingInput.minMarginPct = project.pricingMinMarginPct || 15;
    pricingInput.recommendedMarginPct =
      project.pricingRecommendedMarginPct || 25;
    pricingInput.commissionPct = project.pricingCommissionPct || 0;

    const pricingResult = this.pricingEngineService.calculate(pricingInput);

    // 4. Payback years (simple estimate)
    const annualBill = (project.consumptionMonthlyBill || 0) * 12;
    const annualSavings = annualBill * 0.9; // ~90% savings from solar
    const paybackYears =
      annualSavings > 0 ? pricingResult.finalPrice / annualSavings : 5;

    // 5. Load company and proposal_settings for defaults and snapshots
    const company =
      (await this.companiesService.findOne(companyId)) ?? undefined;
    const settings = await this.proposalSettingsService.findByCompanyId(companyId);

    const companyPaymentDefaults = settings?.paymentDefaults;
    const cardInstallments =
      project.paymentCardInstallments != null &&
      Number(project.paymentCardInstallments) > 0
        ? Number(project.paymentCardInstallments)
        : undefined;
    const financeInstallments =
      project.paymentFinanceInstallments != null &&
      Number(project.paymentFinanceInstallments) > 0
        ? Number(project.paymentFinanceInstallments)
        : undefined;

    const resolvedPaymentConfig = {
      cashDiscountPct:
        dto?.payment?.cashDiscountPct ??
        companyPaymentDefaults?.cashDiscountPct ??
        (company?.cashDiscount != null && Number(company.cashDiscount) > 0
          ? Number(company.cashDiscount)
          : undefined),
      card:
        dto?.payment?.card ??
        companyPaymentDefaults?.card ??
        (cardInstallments && company?.cardTax != null
          ? { installments: cardInstallments, totalMarkupPct: Number(company.cardTax) }
          : undefined),
      finance:
        dto?.payment?.finance ??
        companyPaymentDefaults?.finance ??
        (financeInstallments && company?.financeTax != null
          ? [{ n: financeInstallments, totalMarkupPct: Number(company.financeTax) }]
          : undefined),
      own: dto?.payment?.own ?? companyPaymentDefaults?.own ?? undefined,
    };

    const companySnapshot = company
      ? {
          id: company.id,
          name: company.name,
          logoUrl: company.logoUrl,
          baseCity: company.baseCity,
          state: (company as any).state || '',
          address: (company as any).address || '',
          phone: (company as any).phone || '',
          email: (company as any).email || '',
          cardTax: company.cardTax,
          financeTax: company.financeTax,
          cashDiscount: company.cashDiscount,
        }
      : null;

    const settingsSnapshot = settings
      ? {
          ...settings,
          paymentDefaults: settings.paymentDefaults || resolvedPaymentConfig,
        }
      : null;

    // 5.5 Advance and link lead if project has leadId within company
    let validLeadId: string | undefined = undefined;
    if (project.leadId) {
      try {
        const lead = await this.leadsService.findOne(project.leadId, companyId);
        if (lead) {
          validLeadId = lead.id;
          const advanceableStages: LeadStage[] = [
            LeadStage.NEW,
            LeadStage.CONTACTED,
            LeadStage.QUALIFIED,
            LeadStage.BILL_RECEIVED,
            LeadStage.SIZED,
          ];
          if (advanceableStages.includes(lead.stage as LeadStage)) {
            await this.leadsService.updateStage(
              lead.id,
              companyId,
              LeadStage.PROPOSAL_SENT,
              userId,
            );
          }
        }
      } catch {
        // If lead does not exist in this company, we do not link it and do not alter any other company's lead
      }
    }

    // 6. Create proposal (store snapshot + reference to sources)
    const proposal = this.proposalsRepository.create({
      companyId,
      createdBy: userId,
      publicToken: crypto.randomBytes(16).toString('hex'),
      solarProjectId: projectId,
      quoteId: selectedQuote?.id,
      leadId: validLeadId,
      templateName: 'default',
      settings: {
        pricingInput,
        pricingOutput: pricingResult,
        payment: resolvedPaymentConfig,
        paymentConfig: resolvedPaymentConfig,
        companyDefaults: company
          ? {
            cashDiscount: company.cashDiscount,
            cardTax: company.cardTax,
            financeTax: company.financeTax,
          }
          : {},
      },
      settingsSnapshot,
      companySnapshot,

      // ── Client snapshot ──
      clientName: project.clientName || '—',
      clientCep: project.clientZipcode || '',
      clientCity: project.clientCity || '',
      utility: project.clientUtility || '',
      tariff: project.consumptionTariff ?? 0,
      profile: project.clientModality || '',
      consumptionKwh: project.consumptionMonthlyKwh || 0,

      // ── System snapshot ──
      systemPowerKwp: project.sizingPowerKwp || 0,
      moduleId:
        typeof project.equipmentModules?.[0]?.catalogId === 'string'
          ? project.equipmentModules[0].catalogId
          : undefined,
      inverterId:
        typeof project.equipmentInverters?.[0]?.catalogId === 'string'
          ? project.equipmentInverters[0].catalogId
          : undefined,
      moduleQty: project.sizingModuleQty || 0,

      // ── Cost snapshot ──
      costModules: project.pricingEquipmentCost || 0,
      costInverter: 0,
      costLabor: pricingInput.costInstallation,
      costStructure: 0,
      costTravel: pricingInput.costTravel,
      subtotal: pricingInput.equipmentCost,

      // ── Pricing snapshot ──
      marginPct: pricingResult.appliedMarginPct,
      marginValue: pricingResult.profit,
      finalPrice: pricingResult.finalPrice,
      paybackYears: Math.round(paybackYears * 10) / 10,

      stage: 'proposal_sent',
    });

    // 7. Save kit options (up to 3 options, server calculated)
    if (dto?.options && dto.options.length > 3) {
      throw new BadRequestException('A proposta pode ter no máximo 3 opções de kit');
    }

    const futureLoadsInput =
      dto?.futureLoads ||
      dto?.options?.find((o) => o.futureLoads?.length)?.futureLoads;
    const validatedFutureLoads = this.validateAndEnrichFutureLoads(
      futureLoadsInput,
      settings?.futureLoads || [],
    );

    const hasSizing =
      project.sizingPowerKwp != null &&
      Number(project.sizingPowerKwp) > 0 &&
      project.sizingGenerationKwh != null &&
      Number(project.sizingGenerationKwh) > 0;

    return await this.proposalsRepository.manager.transaction(async (manager) => {
      const savedProposal = await manager.getRepository(Proposal).save(proposal);

      if (hasSizing) {
        const calculated = await this.calculateProjectScenarios(
          projectId,
          companyId,
          validatedFutureLoads,
        );

        const optionEntities = this.buildScenarioOptionEntities(
          savedProposal.id,
          companyId,
          calculated.scenarios,
          dto?.options,
          validatedFutureLoads,
        );

        const savedOptions: ProposalOption[] = [];
        for (const optData of optionEntities) {
          const optEntity = manager.getRepository(ProposalOption).create(optData);
          savedOptions.push(await manager.getRepository(ProposalOption).save(optEntity));
        }
        savedProposal.options = savedOptions;
      } else {
        let moduleName: string | null = null;
        let inverterName: string | null = null;
        if (project.equipmentModules?.length) {
          const m = project.equipmentModules[0];
          moduleName =
            `${m.brand || ''} ${m.model || ''} ${m.power ? m.power + 'W' : ''}`.trim() ||
            null;
        }
        if (project.equipmentInverters?.length) {
          const inv = project.equipmentInverters[0];
          inverterName =
            `${inv.brand || ''} ${inv.model || ''} ${inv.powerKw ? inv.powerKw + 'kW' : ''}`.trim() ||
            null;
        }

        const clientOpt = dto?.options?.[0];
        const isManual = Boolean(
          clientOpt?.isManualPrice &&
          clientOpt?.finalPrice != null &&
          Number(clientOpt.finalPrice) >= 0,
        );
        const finalPrice = isManual
          ? Number(clientOpt!.finalPrice)
          : pricingResult.finalPrice;
        const imageUrl = this.validateImageUrl(clientOpt?.imageUrl, companyId);

        const defaultOpt = manager.getRepository(ProposalOption).create({
          proposalId: savedProposal.id,
          companyId,
          position: 1,
          name:
            clientOpt?.name && clientOpt.name.trim()
              ? clientOpt.name.trim().slice(0, 60)
              : 'Kit 1',
          recommended: true,
          scenarioType: 'recommended',
          scenarioText: 'Sistema dimensionado conforme consumo',
          systemPowerKwp: project.sizingPowerKwp || 0,
          moduleQty: project.sizingModuleQty || 0,
          moduleDesc: moduleName || undefined,
          inverterDesc: inverterName || undefined,
          structureDesc: undefined,
          generationMonthlyKwh: null,
          finalPrice,
          isManualPrice: isManual,
          imageUrl: imageUrl || undefined,
        });
        savedProposal.options = [
          await manager.getRepository(ProposalOption).save(defaultOpt),
        ];
      }

      return savedProposal;
    });
  }

  private validateImageUrl(
    url: string | undefined | null,
    companyId: string,
  ): string | null {
    if (!url || typeof url !== 'string' || url.trim() === '') return null;
    const trimmed = url.trim();

    let parsed: URL;
    try {
      parsed = new URL(trimmed);
    } catch {
      throw new BadRequestException('A URL da imagem é inválida');
    }

    if (parsed.protocol !== 'https:') {
      throw new BadRequestException('A URL da imagem deve utilizar o protocolo HTTPS');
    }

    const supabaseUrl =
      this.configService?.get<string>('SUPABASE_URL') || process.env.SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const expectedHost = new URL(supabaseUrl).hostname.toLowerCase();
        if (parsed.hostname.toLowerCase() !== expectedHost) {
          throw new BadRequestException(
            'A URL da imagem deve pertencer ao Supabase da aplicação',
          );
        }
      } catch {
        if (!parsed.hostname.toLowerCase().endsWith('supabase.co')) {
          throw new BadRequestException(
            'A URL da imagem deve pertencer ao Supabase da aplicação',
          );
        }
      }
    } else {
      if (!parsed.hostname.toLowerCase().endsWith('supabase.co')) {
        throw new BadRequestException(
          'A URL da imagem deve pertencer ao Supabase da aplicação',
        );
      }
    }

    const expectedPrefix = `/storage/v1/object/public/logos/proposals/${companyId}/`;
    if (!parsed.pathname.startsWith(expectedPrefix)) {
      throw new BadRequestException(
        `A URL da imagem deve ser do bucket logos no caminho proposals/${companyId}/`,
      );
    }

    const filename = parsed.pathname.slice(expectedPrefix.length);
    if (!filename || filename.trim().length === 0) {
      throw new BadRequestException(
        `A URL da imagem deve conter o arquivo no caminho proposals/${companyId}/`,
      );
    }

    return trimmed;
  }

  private validateAndEnrichFutureLoads(
    loads: any[] | undefined,
    catalog: any[],
  ): SelectedFutureLoad[] {
    return validateAndEnrichFutureLoads(loads, catalog);
  }

  private buildScenarioOptionEntities(
    proposalId: string,
    companyId: string,
    scenarios: any[],
    clientOptions: ProposalOptionDto[] | undefined,
    validatedFutureLoads: SelectedFutureLoad[],
  ): Partial<ProposalOption>[] {
    const count =
      clientOptions && clientOptions.length > 0
        ? clientOptions.length
        : scenarios.length;

    const optionEntities: Partial<ProposalOption>[] = [];

    for (let i = 0; i < count; i++) {
      const clientOpt = clientOptions?.[i];
      let sc: any;
      let pos = i + 1;

      if (count === 1) {
        sc = scenarios.find((s) => s.scenarioType === 'recommended') || scenarios[0];
        pos = 1;
      } else {
        if (clientOpt?.position === 1) {
          sc = scenarios.find((s) => s.scenarioType === 'essential') || scenarios[0];
          pos = 1;
        } else if (clientOpt?.position === 2) {
          sc =
            scenarios.find((s) => s.scenarioType === 'recommended') ||
            scenarios[1] ||
            scenarios[0];
          pos = 2;
        } else if (clientOpt?.position === 3) {
          sc =
            scenarios.find((s) => s.scenarioType === 'expansion') ||
            scenarios[2] ||
            scenarios[0];
          pos = 3;
        } else {
          sc = scenarios[i] || scenarios[scenarios.length - 1];
          pos = i + 1;
        }
      }

      const name =
        clientOpt?.name && typeof clientOpt.name === 'string' && clientOpt.name.trim()
          ? clientOpt.name.trim().slice(0, 60)
          : sc.name;

      const isManualPrice = Boolean(
        clientOpt?.isManualPrice &&
        clientOpt?.finalPrice != null &&
        Number(clientOpt.finalPrice) >= 0,
      );
      const finalPrice = isManualPrice ? Number(clientOpt!.finalPrice) : sc.finalPrice;
      const imageUrl = this.validateImageUrl(clientOpt?.imageUrl, companyId);

      const isRecommended = count === 1 ? true : sc.scenarioType === 'recommended';

      optionEntities.push({
        proposalId,
        companyId,
        position: pos,
        name,
        recommended: isRecommended,
        scenarioType: sc.scenarioType,
        scenarioText: sc.scenarioText,
        isManualPrice,
        targetConsumptionKwh: sc.targetConsumptionKwh,
        futureLoads: sc.scenarioType === 'expansion' ? validatedFutureLoads : [],
        systemPowerKwp: sc.systemPowerKwp,
        moduleQty: sc.moduleQty,
        moduleDesc: sc.moduleDesc || undefined,
        inverterDesc: sc.inverterDesc || undefined,
        structureDesc: undefined,
        generationMonthlyKwh: sc.generationMonthlyKwh,
        finalPrice,
        imageUrl: imageUrl || undefined,
      });
    }

    return optionEntities;
  }

  async calculateProjectScenarios(
    projectId: string,
    companyId: string,
    futureLoads?: any[],
  ) {
    const project = await this.solarProjectService.findOne(projectId, companyId);
    if (!project) throw new NotFoundException('Projeto não encontrado');

    if (
      project.sizingPowerKwp == null ||
      Number(project.sizingPowerKwp) <= 0 ||
      project.sizingGenerationKwh == null ||
      Number(project.sizingGenerationKwh) <= 0
    ) {
      throw new BadRequestException(
        'Projeto sem dimensionamento. Realize o dimensionamento na etapa anterior para gerar os cenários.',
      );
    }

    const settings = await this.proposalSettingsService.findByCompanyId(companyId);
    const effectiveRules = normalizeSizingRules(settings?.sizingRules);

    const validatedFutureLoads = this.validateAndEnrichFutureLoads(
      futureLoads,
      settings?.futureLoads || [],
    );

    const modulePowerWatt =
      project.equipmentModules?.[0]?.power ||
      (project.sizingPowerKwp &&
        project.sizingModuleQty &&
        Number(project.sizingModuleQty) > 0
        ? Math.round(
          (Number(project.sizingPowerKwp) * 1000) /
          Number(project.sizingModuleQty),
        )
        : 550);

    const moduleUnitPrice =
      project.equipmentModules?.[0]?.unitPrice ||
      (project.pricingEquipmentCost && project.sizingModuleQty
        ? (project.pricingEquipmentCost * 0.6) / project.sizingModuleQty
        : 500);

    const moduleDesc =
      project.equipmentModules?.[0]?.model ||
      (project.equipmentModules?.[0]?.brand
        ? `${project.equipmentModules[0].brand} ${project.equipmentModules[0].model || ''}`.trim()
        : 'Módulos Fotovoltaicos');

    const inverters = await this.inventoryService.findAllInverters(companyId);

    const basePricingInput = new PricingInputDto();
    basePricingInput.costProject = project.pricingProjectCost || 0;
    basePricingInput.costArt = project.pricingArtCost || 0;
    basePricingInput.costInstallation =
      project.pricingInstallationCost || project.pricingLaborCost || 0;
    basePricingInput.costHotel = project.pricingHotelCost || 0;
    basePricingInput.costFreight = project.pricingFreightCost || 0;
    basePricingInput.costFood = project.pricingFoodCost || 0;
    basePricingInput.costTravel = project.pricingTravelCost || 0;
    basePricingInput.costToll = project.pricingTollCost || 0;
    basePricingInput.costCommission = project.pricingCommission || 0;
    basePricingInput.costCrane = project.pricingCraneCost || 0;
    basePricingInput.costThirdParties = project.pricingThirdPartiesCost || 0;
    basePricingInput.costAdmin = project.pricingAdminCost || 0;
    basePricingInput.costTaxes = project.pricingTaxes || 0;
    basePricingInput.costOther = project.pricingOtherCost || 0;
    basePricingInput.marginPct = project.pricingMarginPct || 0;
    basePricingInput.minMarginPct = project.pricingMinMarginPct || 15;
    basePricingInput.recommendedMarginPct =
      project.pricingRecommendedMarginPct || 25;
    basePricingInput.commissionPct = project.pricingCommissionPct || 0;

    const calcResult = calculateScenarios({
      consumptionMonthlyKwh: project.consumptionMonthlyKwh || 0,
      sizingPowerKwp: project.sizingPowerKwp,
      sizingGenerationKwh: project.sizingGenerationKwh,
      modulePowerWatt,
      sizingRules: effectiveRules,
      futureLoads: validatedFutureLoads,
    });

    const enrichedScenarios = calcResult.scenarios.map((sc) => {
      let selectedInverter: any = undefined;
      if (inverters && inverters.length > 0) {
        const compatible = inverters.filter((inv) => {
          const ratio = Number(inv.nominalPowerKw) / sc.systemPowerKwp;
          return ratio >= 0.9 && ratio <= 1.25;
        });
        if (!compatible.length) {
          const sorted = [...inverters].sort(
            (a, b) =>
              Math.abs(Number(a.nominalPowerKw) - sc.systemPowerKwp) -
              Math.abs(Number(b.nominalPowerKw) - sc.systemPowerKwp),
          );
          compatible.push(sorted[0]);
        }
        compatible.sort((a, b) => Number(a.cost) - Number(b.cost));
        selectedInverter = compatible[0];
      }

      let inverterDesc: string;
      let inverterCost = 0;
      if (selectedInverter) {
        inverterDesc = `${selectedInverter.brand} ${selectedInverter.model || ''}`.trim();
        inverterCost = Number(selectedInverter.cost) || 0;
      } else if (project.equipmentInverters?.length) {
        const inv = project.equipmentInverters[0];
        inverterDesc =
          `${inv.brand || ''} ${inv.model || ''}`.trim() ||
          `Inversor Solar ${sc.systemPowerKwp.toFixed(1)} kW`;
        inverterCost = Number(inv.unitPrice) || 0;
      } else {
        inverterDesc = `Inversor Solar ${sc.systemPowerKwp.toFixed(1)} kW`;
        inverterCost = sc.systemPowerKwp * 800;
      }

      const costModules = sc.moduleQty * moduleUnitPrice;
      const costStructure = sc.systemPowerKwp * 300;
      const equipmentCost = costModules + inverterCost + costStructure;

      const pricingInput = { ...basePricingInput, equipmentCost };
      let finalPrice = 0;
      try {
        const pricingRes = this.pricingEngineService.calculate(pricingInput);
        finalPrice = pricingRes.finalPrice;
      } catch {
        finalPrice = Math.round(equipmentCost * 1.35 * 100) / 100;
      }

      return {
        ...sc,
        moduleDesc,
        inverterDesc,
        structureDesc: null,
        calculatedPrice: finalPrice,
        finalPrice,
        isManualPrice: false,
      };
    });

    return {
      ...calcResult,
      scenarios: enrichedScenarios,
    };
  }

  async getOptions(
    proposalId: string,
    companyId: string,
  ): Promise<ProposalOption[]> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id: proposalId, companyId },
    });
    if (!proposal) throw new NotFoundException('Proposta não encontrada');

    return this.proposalOptionsRepository.find({
      where: { proposalId, companyId },
      order: { position: 'ASC' },
    });
  }

  async updateOptions(
    proposalId: string,
    companyId: string,
    dto: UpdateProposalOptionsDto,
  ): Promise<ProposalOption[]> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id: proposalId, companyId },
    });
    if (!proposal) throw new NotFoundException('Proposta não encontrada');

    const optionsArray = Array.isArray(dto) ? dto : dto?.options;
    if (!optionsArray || optionsArray.length === 0) {
      throw new BadRequestException('A proposta deve ter pelo menos uma opção');
    }
    if (optionsArray.length > 3) {
      throw new BadRequestException('A proposta pode ter no máximo 3 opções de kit');
    }

    if (!proposal.solarProjectId) {
      throw new BadRequestException('Proposta sem projeto vinculado');
    }

    const project = await this.solarProjectService.findOne(
      proposal.solarProjectId,
      companyId,
    );
    if (!project) throw new NotFoundException('Projeto vinculado não encontrado');

    const settings = await this.proposalSettingsService.findByCompanyId(companyId);

    const futureLoadsInput =
      (!Array.isArray(dto) && dto?.futureLoads) ||
      optionsArray.find((o: any) => o.futureLoads?.length)?.futureLoads;
    const validatedFutureLoads = this.validateAndEnrichFutureLoads(
      futureLoadsInput,
      settings?.futureLoads || [],
    );

    const hasSizing =
      project.sizingPowerKwp != null &&
      Number(project.sizingPowerKwp) > 0 &&
      project.sizingGenerationKwh != null &&
      Number(project.sizingGenerationKwh) > 0;

    let optionEntities: Partial<ProposalOption>[] = [];

    if (hasSizing) {
      const calculated = await this.calculateProjectScenarios(
        proposal.solarProjectId,
        companyId,
        validatedFutureLoads,
      );

      optionEntities = this.buildScenarioOptionEntities(
        proposalId,
        companyId,
        calculated.scenarios,
        optionsArray,
        validatedFutureLoads,
      );
    } else {
      let moduleName: string | null = null;
      let inverterName: string | null = null;
      if (project.equipmentModules?.length) {
        const m = project.equipmentModules[0];
        moduleName =
          `${m.brand || ''} ${m.model || ''} ${m.power ? m.power + 'W' : ''}`.trim() ||
          null;
      }
      if (project.equipmentInverters?.length) {
        const inv = project.equipmentInverters[0];
        inverterName =
          `${inv.brand || ''} ${inv.model || ''} ${inv.powerKw ? inv.powerKw + 'kW' : ''}`.trim() ||
          null;
      }

      const clientOpt = optionsArray[0];
      const isManual = Boolean(
        clientOpt?.isManualPrice &&
        clientOpt?.finalPrice != null &&
        Number(clientOpt.finalPrice) >= 0,
      );
      const finalPrice = isManual
        ? Number(clientOpt!.finalPrice)
        : Number(proposal.finalPrice || 0);
      const imageUrl = this.validateImageUrl(clientOpt?.imageUrl, companyId);

      optionEntities = [
        {
          proposalId,
          companyId,
          position: 1,
          name:
            clientOpt?.name && clientOpt.name.trim()
              ? clientOpt.name.trim().slice(0, 60)
              : 'Kit 1',
          recommended: true,
          scenarioType: 'recommended',
          scenarioText: 'Sistema dimensionado conforme consumo',
          systemPowerKwp: project.sizingPowerKwp || 0,
          moduleQty: project.sizingModuleQty || 0,
          moduleDesc: moduleName || undefined,
          inverterDesc: inverterName || undefined,
          structureDesc: undefined,
          generationMonthlyKwh: null,
          finalPrice,
          isManualPrice: isManual,
          imageUrl: imageUrl || undefined,
        },
      ];
    }

    return await this.proposalsRepository.manager.transaction(async (manager) => {
      await manager.getRepository(ProposalOption).delete({ proposalId, companyId });
      const saved: ProposalOption[] = [];
      for (const optData of optionEntities) {
        const optEntity = manager.getRepository(ProposalOption).create(optData);
        saved.push(await manager.getRepository(ProposalOption).save(optEntity));
      }
      const recOpt = saved.find((o) => o.recommended) || saved[0];
      const updateData: Partial<Proposal> = { updatedAt: new Date() };
      if (recOpt && recOpt.finalPrice != null) {
        updateData.finalPrice = Number(recOpt.finalPrice);
      }
      await manager.getRepository(Proposal).update({ id: proposalId, companyId }, updateData);
      return saved;
    });
  }

  // ────────── LEGACY create (kept for backward compatibility) ──────────

  async create(companyId: string, userId: string, dto: CreateProposalDto) {
    const calculation = await this.solarEngineService.calculate(
      companyId,
      dto.consumption,
      dto.city,
      dto.moduleId,
      dto.inverterId,
      dto.moduleQty,
    );

    const moduleData = calculation.module
      ? {
        id: calculation.module.id,
        brand: calculation.module.brand,
        model: calculation.module.model,
        powerWatt: calculation.module.powerWatt,
        qty: calculation.module_qty,
      }
      : {};
    const inverterData = calculation.inverter
      ? {
        id: calculation.inverter.id,
        brand: calculation.inverter.brand,
        model: calculation.inverter.model,
        powerKw: calculation.inverter.nominalPowerKw,
        qty: 1,
      }
      : {};

    const solarProject = await this.solarProjectService.create(
      companyId,
      userId,
      {
        leadId: dto.leadId,
        clientName: dto.clientName,
        clientCity: dto.city,
        clientZipcode: dto.clientCep,
        clientUtility: dto.utility,
        consumptionMonthlyKwh: dto.consumption,
        consumptionTariff: dto.tariff,
        clientModality: dto.profile,
      },
    );

    await this.solarProjectService.update(solarProject.id, companyId, {
      status: 'sized',
      sizingPowerKwp: calculation.system_power_kwp,
      sizingGenerationKwh: calculation.monthly_generation,
      sizingModuleQty: calculation.module_qty,
      sizingInverterQty: 1,
      equipmentModules: [moduleData],
      equipmentInverters: [inverterData],
      pricingEquipmentCost:
        calculation.cost_modules + calculation.cost_inverter,
      pricingLaborCost: calculation.cost_labor,
      pricingTravelCost: calculation.cost_travel,
      pricingMarginPct: calculation.margin_pct,
      pricingMarginValue: calculation.margin_value,
      pricingFinalPrice: calculation.final_price,
    });

    const targetLeadId = dto.leadId ?? solarProject?.leadId;
    let validLeadId: string | undefined = undefined;
    if (targetLeadId) {
      try {
        const lead = await this.leadsService.findOne(targetLeadId, companyId);
        if (lead) {
          validLeadId = lead.id;
          const advanceableStages: LeadStage[] = [
            LeadStage.NEW,
            LeadStage.CONTACTED,
            LeadStage.QUALIFIED,
            LeadStage.BILL_RECEIVED,
            LeadStage.SIZED,
          ];
          if (advanceableStages.includes(lead.stage as LeadStage)) {
            await this.leadsService.updateStage(
              lead.id,
              companyId,
              LeadStage.PROPOSAL_SENT,
              userId,
            );
          }
        }
      } catch { }
    }

    const proposal = this.proposalsRepository.create({
      companyId,
      createdBy: userId,
      publicToken: crypto.randomBytes(16).toString('hex'),
      solarProjectId: solarProject.id,
      clientName: dto.clientName,
      clientCep: dto.clientCep,
      clientCity: dto.city,
      consumptionKwh: dto.consumption,
      utility: dto.utility,
      tariff: dto.tariff,
      profile: dto.profile,
      leadId: validLeadId,
      stage: 'proposal_sent',
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,

      systemPowerKwp: calculation.system_power_kwp,
      moduleId: calculation.module?.id,
      inverterId: calculation.inverter?.id,
      moduleQty: calculation.module_qty,

      costModules: calculation.cost_modules,
      costInverter: calculation.cost_inverter,
      costLabor: calculation.cost_labor,
      costStructure: calculation.cost_structure,
      costTravel: calculation.cost_travel,

      subtotal: calculation.subtotal,
      marginPct: calculation.margin_pct,
      marginValue: calculation.margin_value,
      finalPrice: calculation.final_price,
      paybackYears: calculation.payback_years,
    });

    return this.proposalsRepository.save(proposal);
  }

  // ────────── QUERIES ──────────

  findByLead(leadId: string, companyId: string) {
    return this.proposalsRepository.find({
      where: { leadId, companyId },
    });
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 50,
  ): Promise<PaginatedResult<Proposal>> {
    const skip = (page - 1) * limit;
    const [data, total] = await this.proposalsRepository.findAndCount({
      where: { companyId },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(id: string, companyId: string) {
    const proposal = await this.proposalsRepository.findOne({
      where: { id, companyId },
      relations: ['company', 'solarProject'],
    });
    if (!proposal) return null;
    return this.mergeProjectData(proposal);
  }

  async findByToken(token: string) {
    const proposal = await this.proposalsRepository.findOne({
      where: { publicToken: token },
      relations: ['company', 'solarProject'],
    });
    if (!proposal) return null;
    return this.mergeProjectData(proposal);
  }

  async findOneWithRelations(id: string, companyId: string) {
    const proposal = await this.proposalsRepository.findOne({
      where: { id, companyId },
      relations: ['company', 'solarProject'],
    });
    if (!proposal) return null;
    return this.mergeProjectData(proposal);
  }

  async findOnePublic(id: string) {
    const proposal = await this.proposalsRepository.findOne({
      where: { id },
      relations: ['solarProject'],
    });
    if (!proposal) return null;
    return this.mergeProjectData(proposal);
  }

  public mergeProjectData(proposal: Proposal): any {
    const project = proposal.solarProject;
    if (!project) return proposal;

    const moduleData = project.equipmentModules?.[0];
    const inverterData = project.equipmentInverters?.[0];

    let equipmentCost =
      project.pricingEquipmentCost ?? project.pricing?.equipmentCost;
    if (!equipmentCost && proposal.quote) {
      equipmentCost = Number(proposal.quote.totalAmount);
    }

    return {
      ...proposal,
      solarProject: undefined,
      solarProjectId: project.id,
      projectStatus: project.status,
      expirationDate: proposal.expiresAt,
      clientName:
        project.clientName || project.client?.name || proposal.clientName,
      clientCity:
        project.clientCity || project.client?.city || proposal.clientCity,
      clientDocument: project.clientDocument || project.client?.document,
      clientPhone: project.clientPhone || project.client?.phone,
      clientEmail: project.clientEmail || project.client?.email,
      clientState: project.clientState || project.client?.state,
      clientZipcode: project.clientZipcode || project.client?.zipcode,
      clientUtility:
        project.clientUtility ||
        project.consumption?.utility ||
        proposal.utility,
      clientClass: project.clientClass || project.client?.consumerClass,
      clientTariffGroup:
        project.clientTariffGroup || project.client?.tariffGroup,
      clientModality:
        project.clientModality ||
        project.consumption?.modality ||
        project.consumptionModality,
      consultantName: project.consultantName,
      siteAddress: project.siteAddress || project.site?.address,
      siteRoofType: project.siteRoofType || project.site?.roofType,
      siteLatitude: project.siteLatitude ?? project.site?.latitude,
      siteLongitude: project.siteLongitude ?? project.site?.longitude,
      siteInclination: project.siteInclination ?? project.site?.inclination,
      siteAzimuth: project.siteAzimuth ?? project.site?.azimuth,
      utility:
        project.clientUtility ||
        project.consumption?.utility ||
        proposal.utility,
      tariff:
        project.consumptionTariff ??
        project.consumption?.tariff ??
        proposal.tariff,
      consumption:
        project.consumptionMonthlyKwh ??
        project.consumption?.monthlyConsumption ??
        proposal.consumptionKwh,
      monthlyBill:
        project.consumptionMonthlyBill ?? project.consumption?.monthlyBill,
      consumptionModality:
        project.consumptionModality || project.consumption?.modality,
      consumptionDemand:
        project.consumptionDemand ?? project.consumption?.demand,
      systemPowerKwp:
        project.sizingPowerKwp ??
        project.sizing?.systemPowerKwp ??
        proposal.systemPowerKwp,
      sizingGenerationKwh:
        project.sizingGenerationKwh ?? project.sizing?.monthlyGenerationKwh,
      sizingIrradiation:
        project.sizingIrradiation ?? project.sizing?.irradiation,
      sizingLossFactor: project.sizingLossFactor ?? project.sizing?.lossFactor,
      moduleQty:
        project.sizingModuleQty ??
        project.sizing?.moduleQty ??
        proposal.moduleQty,
      inverterQty:
        project.sizingInverterQty ?? project.sizing?.inverterQty ?? 1,
      pricingEquipmentCost: equipmentCost,
      pricingLaborCost: project.pricingLaborCost ?? project.pricing?.laborCost,
      pricingInstallationCost: project.pricingInstallationCost,
      pricingProjectCost:
        project.pricingProjectCost ?? project.pricing?.projectCost,
      pricingArtCost: project.pricingArtCost,
      pricingHotelCost: project.pricingHotelCost,
      pricingFreightCost:
        project.pricingFreightCost ?? project.pricing?.freightCost,
      pricingFoodCost: project.pricingFoodCost,
      pricingTravelCost:
        project.pricingTravelCost ?? project.pricing?.travelCost,
      pricingTollCost: project.pricingTollCost,
      pricingCommission:
        project.pricingCommission ?? project.pricing?.commission,
      pricingCraneCost: project.pricingCraneCost,
      pricingThirdPartiesCost: project.pricingThirdPartiesCost,
      pricingAdminCost: project.pricingAdminCost ?? project.pricing?.adminCost,
      pricingTaxes: project.pricingTaxes ?? project.pricing?.taxes,
      pricingOtherCost: project.pricingOtherCost,
      pricingMarginPct:
        project.pricingMarginPct ??
        project.pricing?.marginPct ??
        proposal.marginPct,
      pricingMarginValue:
        project.pricingMarginValue ??
        project.pricing?.marginValue ??
        proposal.marginValue,
      pricingFinalPrice:
        project.pricingFinalPrice ??
        project.pricing?.finalPrice ??
        proposal.finalPrice,
      pricingTotalCost: project.pricingTotalCost,
      pricingProfit: project.pricingProfit,
      pricingRecommendedPrice: project.pricingRecommendedPrice,
      pricingEffectiveMarginPct: project.pricingEffectiveMarginPct,
      paymentCashDiscount:
        project.paymentCashDiscount ?? project.payment?.cashDiscount,
      paymentCardTax:
        project.paymentCardTax ?? project.payment?.cardTax,
      paymentCardInstallments:
        project.paymentCardInstallments ?? project.payment?.cardInstallments,
      paymentFinanceTax:
        project.paymentFinanceTax ?? project.payment?.financeTax,
      paymentFinanceInstallments:
        project.paymentFinanceInstallments ??
        project.payment?.financeInstallments,
      paymentValidityDays:
        project.paymentValidityDays ?? project.payment?.validityDays,
      equipment:
        moduleData || project.equipment?.modules?.[0]
          ? [
            {
              type: 'module' as const,
              brand:
                moduleData?.brand || project.equipment?.modules?.[0]?.brand,
              model:
                moduleData?.model || project.equipment?.modules?.[0]?.model,
              quantity:
                moduleData?.qty ||
                project.sizingModuleQty ||
                project.sizing?.moduleQty ||
                proposal.moduleQty,
              power: moduleData?.power ? `${moduleData.power}W` : undefined,
            },
          ]
          : undefined,
      equipmentInverters:
        inverterData || project.equipment?.inverters?.[0]
          ? [
            {
              type: 'inverter' as const,
              brand:
                inverterData?.brand ||
                project.equipment?.inverters?.[0]?.brand,
              model:
                inverterData?.model ||
                project.equipment?.inverters?.[0]?.model,
              quantity: inverterData?.qty || 1,
              power: inverterData?.powerKw
                ? `${inverterData.powerKw}kW`
                : undefined,
            },
          ]
          : undefined,
      quotes: project.quotes || undefined,
    };
  }
}
