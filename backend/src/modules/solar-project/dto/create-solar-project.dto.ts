import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateSolarProjectDto {
  @IsOptional()
  @IsString()
  leadId?: string;

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
  @IsOptional() @IsArray() consumptionInvoices?: Array<{
    month: string;
    consumption: number;
    bill: number;
  }>;

  // ── Legacy module compatibility ──
  @IsOptional() @IsObject() client?: Record<string, any>;
  @IsOptional() @IsObject() consumption?: Record<string, any>;
  @IsOptional() @IsObject() site?: Record<string, any>;
}
