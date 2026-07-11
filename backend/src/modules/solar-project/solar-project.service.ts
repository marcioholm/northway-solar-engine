import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { SolarProject } from './entities/solar-project.entity';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';

const STATUS_FLOW = ['draft', 'client', 'site', 'consumption', 'sizing', 'quotes', 'pricing', 'payment', 'review', 'proposal', 'closed_won', 'closed_lost'];

const MODULE_MAP: Record<string, string[]> = {
    client: ['clientName', 'clientDocument', 'clientPhone', 'clientEmail', 'clientCity', 'clientState', 'clientZipcode', 'clientUtility', 'clientClass', 'clientTariffGroup', 'clientModality', 'consultantName'],
    site: ['siteAddress', 'siteZipcode', 'siteLatitude', 'siteLongitude', 'siteRoofType', 'siteInclination', 'siteAzimuth', 'sitePhotos'],
    consumption: ['consumptionMonthlyKwh', 'consumptionMonthlyBill', 'consumptionTariff', 'consumptionDemand', 'consumptionModality', 'consumptionGroup', 'consumptionInvoices'],
    sizing: ['sizingPowerKwp', 'sizingGenerationKwh', 'sizingIrradiation', 'sizingLossFactor', 'sizingModuleQty', 'sizingInverterQty', 'sizingObservations'],
    equipment: ['equipmentModules', 'equipmentInverters', 'equipmentStructures', 'equipmentCables'],
    pricing: ['pricingEquipmentCost', 'pricingLaborCost', 'pricingProjectCost', 'pricingFreightCost', 'pricingTravelCost', 'pricingCommission', 'pricingTaxes', 'pricingAdminCost', 'pricingMarginPct', 'pricingMarginValue', 'pricingMinPrice', 'pricingFinalPrice', 'pricingDiscountPct'],
    payment: ['paymentCashDiscount', 'paymentCardTax', 'paymentCardInstallments', 'paymentFinanceTax', 'paymentFinanceInstallments', 'paymentValidityDays'],
};

const MODULE_KEYS = Object.keys(MODULE_MAP);

function mapModuleToFields(module: string, data: Record<string, any>): Record<string, any> {
    const fieldMap: Record<string, string> = {
        name: 'clientName',
        document: 'clientDocument',
        phone: 'clientPhone',
        email: 'clientEmail',
        city: 'clientCity',
        state: 'clientState',
        zipcode: 'clientZipcode',
        utility: 'clientUtility',
        consumerClass: 'clientClass',
        tariffGroup: 'clientTariffGroup',
        modality: 'clientModality',
        consultantName: 'consultantName',
        address: 'siteAddress',
        latitude: 'siteLatitude',
        longitude: 'siteLongitude',
        roofType: 'siteRoofType',
        inclination: 'siteInclination',
        azimuth: 'siteAzimuth',
        photos: 'sitePhotos',
        monthlyConsumption: 'consumptionMonthlyKwh',
        monthlyBill: 'consumptionMonthlyBill',
        tariff: 'consumptionTariff',
        demand: 'consumptionDemand',
        consumptionModality: 'consumptionModality',
        group: 'consumptionGroup',
        invoices: 'consumptionInvoices',
        systemPowerKwp: 'sizingPowerKwp',
        monthlyGenerationKwh: 'sizingGenerationKwh',
        irradiation: 'sizingIrradiation',
        lossFactor: 'sizingLossFactor',
        moduleQty: 'sizingModuleQty',
        inverterQty: 'sizingInverterQty',
        observations: 'sizingObservations',
        modules: 'equipmentModules',
        inverters: 'equipmentInverters',
        structures: 'equipmentStructures',
        cables: 'equipmentCables',
        equipmentCost: 'pricingEquipmentCost',
        laborCost: 'pricingLaborCost',
        projectCost: 'pricingProjectCost',
        freightCost: 'pricingFreightCost',
        travelCost: 'pricingTravelCost',
        commission: 'pricingCommission',
        taxes: 'pricingTaxes',
        adminCost: 'pricingAdminCost',
        marginPct: 'pricingMarginPct',
        marginValue: 'pricingMarginValue',
        minPrice: 'pricingMinPrice',
        finalPrice: 'pricingFinalPrice',
        discountPct: 'pricingDiscountPct',
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
    ) { }

    async create(companyId: string, userId: string, dto: CreateSolarProjectDto): Promise<SolarProject> {
        const flatData: Partial<SolarProject> = { companyId, createdBy: userId, status: 'draft' };

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
            if (moduleData && typeof moduleData === 'object' && !Array.isArray(moduleData)) {
                Object.assign(flatData as any, mapModuleToFields(mod, moduleData));
                (flatData as any)[mod] = moduleData;
            }
        }

        if (dto.leadId) flatData.leadId = dto.leadId;

        const project = this.repository.create(flatData);
        return this.repository.save(project);
    }

    findAll(companyId: string, filters?: { status?: string; query?: string; consultant?: string }): Promise<SolarProject[]> {
        const where: any = { companyId };
        if (filters?.status) where.status = filters.status;
        if (filters?.consultant) where.consultantName = filters.consultant;
        if (filters?.query) {
            where.clientName = Like(`%${filters.query}%`);
        }
        return this.repository.find({
            where,
            order: { updatedAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<SolarProject> {
        const project = await this.repository.findOne({
            where: { id },
            relations: ['quotes', 'quotes.items', 'proposals'],
        });
        if (!project) throw new NotFoundException('SolarProject not found');
        return project;
    }

    async update(id: string, dto: UpdateSolarProjectDto): Promise<SolarProject> {
        const project = await this.findOne(id);

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
            if (moduleData && typeof moduleData === 'object' && !Array.isArray(moduleData)) {
                Object.assign(project as any, mapModuleToFields(mod, moduleData));
            }
        }

        if (dto.status !== undefined) project.status = dto.status;
        return this.repository.save(project);
    }

    async updateModule(id: string, module: string, data: Record<string, any>): Promise<SolarProject> {
        if (!MODULE_KEYS.includes(module)) {
            throw new NotFoundException(`Module '${module}' not found`);
        }
        const dto = new UpdateSolarProjectDto();
        (dto as any)[module] = data;
        return this.update(id, dto);
    }

    async advanceStatus(id: string): Promise<SolarProject> {
        const project = await this.findOne(id);
        const idx = STATUS_FLOW.indexOf(project.status);
        if (idx < STATUS_FLOW.length - 1) {
            project.status = STATUS_FLOW[idx + 1];
        }
        return this.repository.save(project);
    }

    async updateStatus(id: string, status: string): Promise<SolarProject> {
        const project = await this.findOne(id);
        project.status = status;
        return this.repository.save(project);
    }

    getByLead(leadId: string): Promise<SolarProject[]> {
        return this.repository.find({ where: { leadId }, order: { createdAt: 'DESC' } });
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        await this.repository.remove(project);
    }
}
