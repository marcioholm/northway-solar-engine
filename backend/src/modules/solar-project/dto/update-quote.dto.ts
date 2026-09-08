import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';

export class UpdateQuoteDto {
  @IsOptional() @IsString() supplierName?: string;
  @IsOptional() @IsString() supplierContact?: string;
  @IsOptional() @IsString() supplierPhone?: string;
  @IsOptional() @IsString() supplierEmail?: string;
  @IsOptional() @IsString() quoteNumber?: string;
  @IsOptional() @IsDateString() quoteDate?: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() paymentCondition?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() totalAmount?: number;
  @IsOptional() @IsNumber() shippingCost?: number;
  @IsOptional() @IsBoolean() selected?: boolean;
  @IsOptional() @IsString() notes?: string;
}
