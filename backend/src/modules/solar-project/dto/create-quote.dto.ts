import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsDateString,
  IsBoolean,
} from 'class-validator';

class QuoteItemDto {
  @IsString() productType: string;
  @IsOptional() @IsString() productName?: string;
  @IsOptional() @IsString() productBrand?: string;
  @IsOptional() @IsString() productModel?: string;
  @IsNumber() quantity: number;
  @IsNumber() unitPrice: number;
}

export class CreateQuoteDto {
  @IsOptional() @IsString() supplierName?: string;
  @IsOptional() @IsString() supplierContact?: string;
  @IsOptional() @IsString() supplierPhone?: string;
  @IsOptional() @IsString() supplierEmail?: string;
  @IsOptional() @IsString() quoteNumber?: string;
  @IsOptional() @IsDateString() quoteDate?: string;
  @IsOptional() @IsDateString() validUntil?: string;
  @IsOptional() @IsString() paymentCondition?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsNumber() shippingCost?: number;
  @IsOptional() @IsBoolean() selected?: boolean;
  @IsOptional() @IsString() notes?: string;
  @IsArray() items: QuoteItemDto[];
}
