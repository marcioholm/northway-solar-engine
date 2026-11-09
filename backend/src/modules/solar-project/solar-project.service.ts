import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SolarProject } from './entities/solar-project.entity';
import { Lead } from '../leads/entities/lead.entity';
import { UserRole } from '../users/entities/user.entity';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';

const STATUS_FLOW = [
  'draft',
  'client',
  'site',
  'consumption',
  'sizing',
  'quotes',
  'costs',
  'pricing',
  'payment',
  'review',
  'proposal',
  'closed_won',
  'closed_lost',
];

const MODULE_MAP: Record<string, string[]> = {
  client: [
    'clientName',
    'clientDocument',
    'clientPhone',
    'clientEmail',
    'clientCity',
    'clientState',
    'clientZipcode',
    'clientUtility',
    'clientClass',
    'clientTariffGroup',
    'clientModality',
    'consultantName',
  ],
  site: [
    'siteAddress',
    'siteZipcode',
    'siteLatitude',
    'siteLongitude',
    'siteRoofType',
    'siteInclination',
    'siteAzimuth',
    'sitePhotos',
  ],
  consumption: [
    'consumptionMonthlyKwh',
    'consumptionMonthlyBill',
    'consumptionTariff',
    'consumptionDemand',
    'consumptionModality',
    'consumptionGroup',
    'consumptionInvoices',
  ],
  sizing: [
    'sizingPowerKwp',
    'sizingMonthlyKwh',
    'sizingAreaM2',
    'sizingModuleQty',
    'sizingGenerationKwh',
    'sizingOverloadPct',
    'sizingLossFactor',
    'sizingPerformanceRatio',
    'sizingObservations',
  ],
  equipment: ['equipmentModules', 'equipmentInverters', 'equipmentStructures'],
  pricing: [
    'pricingEquipmentCost',
    'pricingProjectCost',
    'pricingLaborCost',
    'pricingInstallationCost',
    'pricingArtCost',
    'pricingHotelCost',
    'pricingFoodCost',
    'pricingFreightCost',
    'pricingTravelCost',
    'pricingTravelDistance',
    'pricingTravelTrips',
    'pricingFuelEfficiency',
    'pricingFuelPrice',
    'pricingTollCost',
    'pricingTaxes',
    'pricingCommission',
    'pricingCommissionPct',
    'pricingAdminCost',
    'pricingMarginPct',
    'pricingCraneCost',
    'pricingThirdPartiesCost',
    'pricingOtherCost',
    'pricingTotalCost',
    'pricingProfit',
    'pricingRecommendedPrice',
    'pricingEffectiveMarginPct',
    'pricingMinMarginPct',
    'pricingRecommendedMarginPct',
  ],
  payment: [
    'paymentCashDiscount',
    'paymentCardTax',
    'paymentCardInstallments',
    'paymentFinanceTax',
    'paymentFinanceInstallments',
    'paymentValidityDays',
  ],
};

const MODULE_KEYS = Object.keys(MODULE_MAP);

function mapModuleToFields(module: string, data: Record<string, any>): Record<string, any> {
  const fieldMap: Record<string, string> = {
    // client
    name: 'clientName',
    document: 'clientDocument',
    phone: 'clientPhone',
    email: 'clientEmail',
    city: 'clientCity',
    state: 'clientState',
    zipcode: 'clientZipcode',
    utility: 'clientUtility',
    class: 'clientClass',
    tariffGroup: 'clientTariffGroup',
    modality: 'clientModality',
    consultant: 'consultantName',
    // site
    address: 'siteAddress',
    latitude: 'siteLatitude',
    longitude: 'siteLongitude',
    roofType: 'siteRoofType',
    inclination: 'siteInclination',
    azimuth: 'siteAzimuth',
    photos: 'sitePhotos',
    // consumption
    monthlyKwh: 'consumptionMonthlyKwh',
    monthlyBill: 'consumptionMonthlyBill',
    tariff: 'consumptionTariff',
    demand: 'consumptionDemand',
    group: 'consumptionGroup',
    invoices: 'consumptionInvoices',
    // sizing
    powerKwp: 'sizingPowerKwp',
    areaM2: 'sizingAreaM2',
    moduleQty: 'sizingModuleQty',
    generationKwh: 'sizingGenerationKwh',
    overloadPct: 'sizingOverloadPct',
    lossFactor: 'sizingLossFactor',
    performanceRatio: 'sizingPerformanceRatio',
    // equipment
    modules: 'equipmentModules',
    inverters: 'equipmentInverters',
    structures: 'equipmentStructures',
    // pricing
    equipmentCost: 'pricingEquipmentCost',
    projectCost: 'pricingProjectCost',
    laborCost: 'pricingLaborCost',
    installationCost: 'pricingInstallationCost',
    artCost: 'pricingArtCost',
    hotelCost: 'pricingHotelCost',
    foodCost: 'pricingFoodCost',
    freightCost: 'pricingFreightCost',
    travelCost: 'pricingTravelCost',
    tollCost: 'pricingTollCost',
    taxes: 'pricingTaxes',
    commission: 'pricingCommission',
    commissionPct: 'pricingCommissionPct',
    adminCost: 'pricingAdminCost',
    marginPct: 'pricingMarginPct',
    craneCost: 'pricingCraneCost',
    thirdPartiesCost: 'pricingThirdPartiesCost',
    otherCost: 'pricingOtherCost',
    totalCost: 'pricingTotalCost',
    profit: 'pricingProfit',
    recommendedPrice: 'pricingRecommendedPrice',
    effectiveMarginPct: 'pricingEffectiveMarginPct',
    minMarginPct: 'pricingMinMarginPct',
    recommendedMarginPct: 'pricingRecommendedMarginPct',
    cashDiscount: 'paymentCashDiscount',
    cardTax: 'paymentCardTax',
    cardInstallments: 'paymentCardInstallments',
    financeTax: 'paymentFinanceTax',
    financeInstallments: 'paymentFinanceInstallments',
    validityDays: 'paymentValidityDays',
  };
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    const field = fieldMap[key];
    if (field) result[field] = value;
  }
  return result;
}

@Injectable()
export class SolarProjectService {
  constructor(
    @InjectRepository(SolarProject)
    private repository: Repository<SolarProject>,
    @InjectRepository(Lead)
    private leadsRepository: Repository<Lead>,
  ) {}

  async create(
    companyId: string,
    userId: string,
    dto: CreateSolarProjectDto,
    role?: UserRole | string,
  ): Promise<SolarProject> {
    const flatData: Partial<SolarProject> = {
      companyId,
      createdBy: userId,
      status: 'draft',
    };

    // Map flat fields from DTO
    const allFields = Object.values(MODULE_MAP).flat();
    for (const field of allFields) {
      if ((dto as any)[field] !== undefined) {
        (flatData as any)[field] = (dto as any)[field];
      }
    }

    // Legacy: map module objects to typed fields + keep JSONB populated
    for (const mod of MODULE_KEYS) {
      const moduleData = (dto as any)[mod];
      if (
        moduleData &&
        typeof moduleData === 'object' &&
        !Array.isArray(moduleData)
      ) {
        Object.assign(flatData as any, mapModuleToFields(mod, moduleData));
        (flatData as any)[mod] = moduleData;
      }
    }

    if (dto.leadId) flatData.leadId = dto.leadId;

    // Regra: projeto herda o dono do lead; se criado por seller fica com ele como dono
    let ownerUserId = (dto as any).ownerUserId;
    if (!ownerUserId && dto.leadId) {
      const lead = await this.leadsRepository.findOne({
        where: { id: dto.leadId, companyId },
      });
      if (lead?.assignedTo) {
        ownerUserId = lead.assignedTo;
      }
    }
    if (!ownerUserId && role === UserRole.SELLER) {
      ownerUserId = userId;
    }
    flatData.ownerUserId = ownerUserId || null;

    const project = this.repository.create(flatData);
    return this.repository.save(project);
  }

  async findAll(
    companyId: string,
    filters?: {
      status?: string;
      query?: string;
      consultant?: string;
      page?: number;
      limit?: number;
      ownerUserId?: string;
    },
  ): Promise<PaginatedResult<SolarProject>> {
    const where: any = { companyId };
    if (filters?.ownerUserId) where.ownerUserId = filters.ownerUserId;
    if (filters?.status) where.status = filters.status;
    if (filters?.consultant) where.consultantName = filters.consultant;
    if (filters?.query) {
      where.clientName = Like(`%${filters.query}%`);
    }
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;
    const [data, total] = await this.repository.findAndCount({
      where,
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findOne(
    id: string,
    companyId: string,
    ownerUserId?: string,
  ): Promise<SolarProject> {
    const where: any = { id, companyId };
    if (ownerUserId) {
      where.ownerUserId = ownerUserId;
    }
    const project = await this.repository.findOne({
      where,
      relations: ['quotes', 'quotes.items', 'proposals'],
    });
    if (!project) throw new NotFoundException('SolarProject not found');
    return project;
  }

  async update(
    id: string,
    companyId: string,
    dto: UpdateSolarProjectDto,
    ownerUserId?: string,
  ): Promise<SolarProject> {
    const project = await this.findOne(id, companyId, ownerUserId);

    if (ownerUserId && (dto as any).ownerUserId && (dto as any).ownerUserId !== ownerUserId) {
      delete (dto as any).ownerUserId;
    }

    // Apply flat typed fields
    const allFields = Object.values(MODULE_MAP).flat();
    for (const field of allFields) {
      if ((dto as any)[field] !== undefined) {
        (project as any)[field] = (dto as any)[field];
      }
    }
    if (dto.extra !== undefined) project.extra = dto.extra;

    // Legacy: map module objects to typed fields + keep JSONB populated
    for (const mod of MODULE_KEYS) {
      const moduleData = (dto as any)[mod];
      if (
        moduleData &&
        typeof moduleData === 'object' &&
        !Array.isArray(moduleData)
      ) {
        Object.assign(project as any, mapModuleToFields(mod, moduleData));
      }
    }

    if (dto.status !== undefined) project.status = dto.status;
    return this.repository.save(project);
  }

  async updateModule(
    id: string,
    companyId: string,
    module: string,
    data: Record<string, any>,
    ownerUserId?: string,
  ): Promise<SolarProject> {
    if (!MODULE_KEYS.includes(module)) {
      throw new NotFoundException(`Module '${module}' not found`);
    }
    const dto = new UpdateSolarProjectDto();
    (dto as any)[module] = data;
    return this.update(id, companyId, dto, ownerUserId);
  }

  async advanceStatus(
    id: string,
    companyId: string,
    ownerUserId?: string,
  ): Promise<SolarProject> {
    const project = await this.findOne(id, companyId, ownerUserId);
    const idx = STATUS_FLOW.indexOf(project.status);
    if (idx < STATUS_FLOW.length - 1) {
      project.status = STATUS_FLOW[idx + 1];
    }
    return this.repository.save(project);
  }

  async updateStatus(
    id: string,
    companyId: string,
    status: string,
    ownerUserId?: string,
  ): Promise<SolarProject> {
    const project = await this.findOne(id, companyId, ownerUserId);
    project.status = status;
    return this.repository.save(project);
  }

  getByLead(
    leadId: string,
    companyId: string,
    ownerUserId?: string,
  ): Promise<SolarProject[]> {
    const where: any = { leadId, companyId };
    if (ownerUserId) where.ownerUserId = ownerUserId;
    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async remove(
    id: string,
    companyId: string,
    ownerUserId?: string,
  ): Promise<void> {
    const project = await this.findOne(id, companyId, ownerUserId);
    await this.repository.remove(project);
  }
}
