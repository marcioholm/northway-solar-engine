import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedFutureLoadDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  powerKw?: number;

  @IsOptional()
  @IsNumber()
  fixedKwh?: number;

  @IsOptional()
  @IsNumber()
  hoursPerDay?: number;

  @IsOptional()
  @IsNumber()
  daysPerMonth?: number;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class ProposalOptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsInt()
  @Min(1)
  @Max(3)
  position: number;

  @IsString()
  name: string;

  @IsBoolean()
  recommended: boolean;

  @IsOptional()
  @IsString()
  scenarioType?: string;

  @IsOptional()
  @IsString()
  scenarioText?: string;

  @IsOptional()
  @IsBoolean()
  isManualPrice?: boolean;

  @IsOptional()
  @IsNumber()
  targetConsumptionKwh?: number | null;

  @IsOptional()
  @IsArray()
  futureLoads?: any[];

  @IsNumber()
  systemPowerKwp: number;

  @IsInt()
  moduleQty: number;

  @IsOptional()
  @IsString()
  moduleDesc?: string;

  @IsOptional()
  @IsString()
  inverterDesc?: string;

  @IsOptional()
  @IsString()
  structureDesc?: string;

  @IsOptional()
  @IsNumber()
  generationMonthlyKwh?: number | null;

  @IsNumber()
  finalPrice: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class ProposalPaymentCustomDto {
  cashDiscountPct?: number | null;
  card?: { installments?: number; totalMarkupPct?: number } | null;
  finance?: Array<{ n: number; totalMarkupPct: number }> | null;
  own?: { downPaymentPct?: number; installments?: number } | null;
}

export class GenerateProposalDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProposalOptionDto)
  options?: ProposalOptionDto[];

  @IsOptional()
  @IsObject()
  payment?: ProposalPaymentCustomDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];

  @IsOptional()
  @IsObject()
  sizingRules?: Record<string, any>;
}

export class CalculateScenariosDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];

  @IsOptional()
  @IsObject()
  sizingRules?: Record<string, any>;
}
