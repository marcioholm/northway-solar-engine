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
}
