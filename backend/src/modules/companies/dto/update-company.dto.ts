import { PartialType } from '@nestjs/swagger';
import { CreateCompanyDto } from './create-company.dto';

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  logoUrl?: string;
  cardTax?: number;
  financeTax?: number;
  cashDiscount?: number;
  metaPixelId?: string;
  metaAccessToken?: string;
  metaAdAccountId?: string;
  metaDatasetId?: string;
}
