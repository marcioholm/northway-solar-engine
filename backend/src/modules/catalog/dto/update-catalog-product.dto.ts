import { Allow } from 'class-validator';
export class UpdateCatalogProductDto {
  @Allow()
  category?:
    | 'module'
    | 'inverter'
    | 'structure'
    | 'cable'
    | 'connector'
    | 'protection'
    | 'service';
  @Allow()
  brand?: string;
  @Allow()
  line?: string;
  @Allow()
  model?: string;
  @Allow()
  sku?: string;
  @Allow()
  purchasePrice?: number;
  @Allow()
  suggestedPrice?: number;
  @Allow()
  unit?: string;
  @Allow()
  active?: boolean;
  @Allow()
  specs?: Record<string, any>;
  @Allow()
  compatibility?: Record<string, any>;
  @Allow()
  tags?: string[];
  @Allow()
  supplierId?: string;
}
