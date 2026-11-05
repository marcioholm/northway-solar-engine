import { Allow } from 'class-validator';
export class CatalogQueryDto {
  @Allow()
  category?: string;
  @Allow()
  q?: string;
  @Allow()
  brand?: string;
  @Allow()
  active?: string;
  @Allow()
  supplierId?: string;
  @Allow()
  page?: number = 1;
  @Allow()
  limit?: number = 50;
}
