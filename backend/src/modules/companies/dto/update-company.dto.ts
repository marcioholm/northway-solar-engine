import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaPixelId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1024)
  metaAccessToken?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaAdAccountId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaDatasetId?: string;
}
