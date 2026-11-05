import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(255)
  baseCity: string;

  @IsNumber()
  @Min(0)
  costPerKm: number;

  @IsNumber()
  @Min(0)
  @Max(99)
  defaultMargin: number;

  @IsNumber()
  @Min(0)
  @Max(1)
  lossFactor: number;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cardTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  financeTax?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cashDiscount?: number;
}
