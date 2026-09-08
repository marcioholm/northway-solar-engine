export class CatalogQueryDto {
  category?: string;
  q?: string;
  brand?: string;
  active?: string;
  supplierId?: string;
  page?: number = 1;
  limit?: number = 50;
}
