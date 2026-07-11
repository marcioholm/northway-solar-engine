import { IsOptional, IsString, IsNumber, IsArray, IsDateString } from 'class-validator';

export class UpdateQuoteDto {
    @IsOptional() @IsString() supplierName?: string;
    @IsOptional() @IsString() supplierContact?: string;
    @IsOptional() @IsString() supplierPhone?: string;
    @IsOptional() @IsString() supplierEmail?: string;
    @IsOptional() @IsString() status?: string;
    @IsOptional() @IsNumber() totalAmount?: number;
    @IsOptional() @IsNumber() shippingCost?: number;
    @IsOptional() @IsDateString() validUntil?: string;
    @IsOptional() @IsString() notes?: string;
}
