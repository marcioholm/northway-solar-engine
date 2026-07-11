import { IsOptional, IsString, IsNumber, IsArray, IsObject } from 'class-validator';

export class UpdateSolarProjectDto {
    @IsOptional() @IsString() status?: string;

    // ── Client ──
    @IsOptional() @IsString() clientName?: string;
    @IsOptional() @IsString() clientDocument?: string;
    @IsOptional() @IsString() clientPhone?: string;
    @IsOptional() @IsString() clientEmail?: string;
    @IsOptional() @IsString() clientCity?: string;
    @IsOptional() @IsString() clientState?: string;
    @IsOptional() @IsString() clientZipcode?: string;
    @IsOptional() @IsString() clientUtility?: string;
    @IsOptional() @IsString() clientClass?: string;
    @IsOptional() @IsString() clientTariffGroup?: string;
    @IsOptional() @IsString() clientModality?: string;
    @IsOptional() @IsString() consultantName?: string;

    // ── Site ──
    @IsOptional() @IsString() siteAddress?: string;
    @IsOptional() @IsString() siteZipcode?: string;
    @IsOptional() @IsNumber() siteLatitude?: number;
    @IsOptional() @IsNumber() siteLongitude?: number;
    @IsOptional() @IsString() siteRoofType?: string;
    @IsOptional() @IsNumber() siteInclination?: number;
    @IsOptional() @IsNumber() siteAzimuth?: number;
    @IsOptional() @IsArray() sitePhotos?: string[];

    // ── Consumption ──
    @IsOptional() @IsNumber() consumptionMonthlyKwh?: number;
    @IsOptional() @IsNumber() consumptionMonthlyBill?: number;
    @IsOptional() @IsNumber() consumptionTariff?: number;
    @IsOptional() @IsNumber() consumptionDemand?: number;
    @IsOptional() @IsString() consumptionModality?: string;
    @IsOptional() @IsString() consumptionGroup?: string;
    @IsOptional() @IsArray() consumptionInvoices?: Array<{ month: string; consumption: number; bill: number }>;

    // ── Sizing ──
    @IsOptional() @IsNumber() sizingPowerKwp?: number;
    @IsOptional() @IsNumber() sizingGenerationKwh?: number;
    @IsOptional() @IsNumber() sizingIrradiation?: number;
    @IsOptional() @IsNumber() sizingLossFactor?: number;
    @IsOptional() @IsNumber() sizingModuleQty?: number;
    @IsOptional() @IsNumber() sizingInverterQty?: number;
    @IsOptional() @IsString() sizingObservations?: string;

    // ── Equipment ──
    @IsOptional() @IsArray() equipmentModules?: Array<any>;
    @IsOptional() @IsArray() equipmentInverters?: Array<any>;
    @IsOptional() @IsArray() equipmentStructures?: Array<any>;
    @IsOptional() @IsArray() equipmentCables?: Array<any>;

    // ── Pricing ──
    @IsOptional() @IsNumber() pricingEquipmentCost?: number;
    @IsOptional() @IsNumber() pricingLaborCost?: number;
    @IsOptional() @IsNumber() pricingProjectCost?: number;
    @IsOptional() @IsNumber() pricingFreightCost?: number;
    @IsOptional() @IsNumber() pricingTravelCost?: number;
    @IsOptional() @IsNumber() pricingCommission?: number;
    @IsOptional() @IsNumber() pricingTaxes?: number;
    @IsOptional() @IsNumber() pricingAdminCost?: number;
    @IsOptional() @IsNumber() pricingMarginPct?: number;
    @IsOptional() @IsNumber() pricingMarginValue?: number;
    @IsOptional() @IsNumber() pricingMinPrice?: number;
    @IsOptional() @IsNumber() pricingFinalPrice?: number;
    @IsOptional() @IsNumber() pricingDiscountPct?: number;

    // ── Payment ──
    @IsOptional() @IsNumber() paymentCashDiscount?: number;
    @IsOptional() @IsNumber() paymentCardTax?: number;
    @IsOptional() @IsNumber() paymentCardInstallments?: number;
    @IsOptional() @IsNumber() paymentFinanceTax?: number;
    @IsOptional() @IsNumber() paymentFinanceInstallments?: number;
    @IsOptional() @IsNumber() paymentValidityDays?: number;

    // ── Extra ──
    @IsOptional() @IsObject() extra?: Record<string, any>;

    // ── Legacy module backward compatibility ──
    @IsOptional() @IsObject() client?: Record<string, any>;
    @IsOptional() @IsObject() consumption?: Record<string, any>;
    @IsOptional() @IsObject() site?: Record<string, any>;
    @IsOptional() @IsObject() sizing?: Record<string, any>;
    @IsOptional() @IsObject() equipment?: Record<string, any>;
    @IsOptional() @IsObject() pricing?: Record<string, any>;
    @IsOptional() @IsObject() payment?: Record<string, any>;
}
