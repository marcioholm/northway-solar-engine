import { Allow } from 'class-validator';
export class CreateCatalogProductDto {
  @Allow()
  category:
    | 'module'
    | 'inverter'
    | 'structure'
    | 'cable'
    | 'connector'
    | 'protection'
    | 'service'
    | 'material';
  @Allow()
  brand: string;
  @Allow()
  line?: string;
  @Allow()
  model: string;
  @Allow()
  sku?: string;
  @Allow()
  purchasePrice: number;
  @Allow()
  suggestedPrice?: number;
  @Allow()
  unit?: string;
  @Allow()
  active?: boolean;
  @Allow()
  manufacturerId?: string;
  @Allow()
  stockQuantity?: number;
  @Allow()
  minStock?: number;
  @Allow()
  warrantyYears?: number;
  @Allow()
  specs?: Record<string, any>;
  @Allow()
  compatibility?: Record<string, any>;
  @Allow()
  tags?: string[];
  @Allow()
  supplierId?: string;
}
