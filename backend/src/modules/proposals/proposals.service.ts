import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './entities/proposal.entity';
import { ProposalEvent } from './entities/proposal-event.entity';
import { SolarEngineService } from '../solar-engine/solar-engine.service';
import { SolarProjectService } from '../solar-project/solar-project.service';
import { PricingEngineService } from '../pricing-engine/pricing-engine.service';
import { CompaniesService } from '../companies/companies.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { PricingInputDto } from '../pricing-engine/dto/pricing-input.dto';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';
import { ProposalHtmlRenderer } from './renderers/proposal-html.renderer';
import { ProposalWebRenderer } from './renderers/proposal-web.renderer';
import { ProposalPdfRenderer } from './renderers/proposal-pdf.renderer';
import { ProposalAssembledData } from './renderers/proposal-renderer.interface';

import * as crypto from 'crypto';

@Injectable()
export class ProposalsService {
  private readonly htmlRenderer = new ProposalHtmlRenderer();
  private readonly webRenderer = new ProposalWebRenderer();
  private readonly pdfRenderer = new ProposalPdfRenderer(this.htmlRenderer);

  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(ProposalEvent)
    private proposalEventsRepository: Repository<ProposalEvent>,
    private solarEngineService: SolarEngineService,
    private solarProjectService: SolarProjectService,
    private pricingEngineService: PricingEngineService,
    private companiesService: CompaniesService,
  ) {}

  // ────────── TRACKING ──────────
  
  async trackEvent(token: string, eventType: string, durationSeconds: number, ipAddress?: string, userAgent?: string) {
    const proposal = await this.proposalsRepository.findOne({ where: { publicToken: token } });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const event = this.proposalEventsRepository.create({
      proposalId: proposal.id,
      eventType,
      durationSeconds,
      ipAddress,
      userAgent,
    });
    return this.proposalEventsRepository.save(event);
  }

  async getEvents(proposalId: string) {
    return this.proposalEventsRepository.find({
      where: { proposalId },
      order: { createdAt: 'DESC' },
    });
  }

  // ────────── ASSEMBLER ──────────

  async assemble(proposalId: string, companyId: string): Promise<ProposalAssembledData> {
    const proposal = await this.proposalsRepository.findOne({
      where: { id: proposalId, companyId },
      relations: ['solarProject', 'company', 'quote', 'quote.items'],
    });
    if (!proposal) throw new NotFoundException('Proposal not found');

    const company =
      proposal.company ??
      (proposal.companyId
        ? await this.companiesService.findOne(proposal.companyId)
        : undefined) ??
      undefined;

    return {
      proposal,
      company,
      consultantName: undefined,
      consultantPhone: undefined,
    };
  }

  // ────────── RENDERER ──────────

  render(proposalId: string, companyId: string, format: 'html' | 'pdf' | 'web' = 'html') {
    return this.assemble(proposalId, companyId).then((data) => {
      switch (format) {
        case 'pdf':
          return this.pdfRenderer.render(data);
        case 'web':
          return this.webRenderer.render(data);
        default:
          return this.htmlRenderer.render(data);
      }
    });
  }

  // ────────── NEW GENERATE (no calculations) ──────────

  async generate(
    projectId: string,
    companyId: string,
    userId: string,
  ): Promise<Proposal> {
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

    const pricingResult = this.pricingEngineService.calculate(pricingInput);

    // 4. Payback years (simple estimate)
    const annualBill = (project.consumptionMonthlyBill || 0) * 12;
    const annualSavings = annualBill * 0.9; // ~90% savings from solar
    const paybackYears =
      annualSavings > 0 ? pricingResult.finalPrice / annualSavings : 5;

    // 5. Load company for defaults
    const company =
      (await this.companiesService.findOne(companyId)) ?? undefined;

    // 6. Create proposal (store snapshot + reference to sources)
    const proposal = this.proposalsRepository.create({
      companyId,
      createdBy: userId,
      publicToken: crypto.randomBytes(16).toString('hex'),
      solarProjectId: projectId,
      quoteId: selectedQuote?.id,
      templateName: 'default',
      settings: {
        pricingInput,
        pricingOutput: pricingResult,
        companyDefaults: company
          ? {
              cashDiscount: company.cashDiscount,
              cardTax: company.cardTax,
              financeTax: company.financeTax,
            }
          : {},
      },

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

    return this.proposalsRepository.save(proposal);
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
      leadId: dto.leadId,
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
      paymentCardInstallments:
        project.paymentCardInstallments ?? project.payment?.cardInstallments,
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
