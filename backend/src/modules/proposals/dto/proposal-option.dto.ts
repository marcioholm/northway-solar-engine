import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SelectedFutureLoadDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(1)
  @Max(20)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(24)
  hoursPerDay?: number;
}

export class ProposalOptionDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3)
  position?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  name?: string;

  @IsOptional()
  @IsBoolean()
  isManualPrice?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  finalPrice?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];
}

export class ProposalPaymentCardDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(240)
  installments?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  totalMarkupPct?: number;
}

export class ProposalPaymentFinanceOptionDto {
  @IsInt()
  @Min(1)
  @Max(240)
  n: number;

  @IsNumber()
  @Min(0)
  @Max(300)
  totalMarkupPct: number;
}

export class ProposalPaymentOwnPlanDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  downPaymentPct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  entradaPct?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  installments?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(60)
  boletos?: number;
}

export class ProposalPaymentCustomDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  cashDiscountPct?: number | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProposalPaymentCardDto)
  card?: ProposalPaymentCardDto | null;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => ProposalPaymentFinanceOptionDto)
  finance?: ProposalPaymentFinanceOptionDto[] | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProposalPaymentOwnPlanDto)
  own?: ProposalPaymentOwnPlanDto | null;
}

export class GenerateProposalDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ProposalOptionDto)
  options?: ProposalOptionDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProposalPaymentCustomDto)
  payment?: ProposalPaymentCustomDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];
}

export class UpdateProposalOptionsDto {
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => ProposalOptionDto)
  options: ProposalOptionDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];
}

export class CalculateScenariosDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectedFutureLoadDto)
  futureLoads?: SelectedFutureLoadDto[];
}
