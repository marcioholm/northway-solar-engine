import { Allow } from 'class-validator';
export class CreateCatalogSupplierDto {
  @Allow()
  name: string;
  @Allow()
  contact?: string;
  @Allow()
  phone?: string;
  @Allow()
  email?: string;
  @Allow()
  city?: string;
  @Allow()
  state?: string;
  @Allow()
  avgLeadTime?: number;
  @Allow()
  notes?: string;
  @Allow()
  active?: boolean;
}
