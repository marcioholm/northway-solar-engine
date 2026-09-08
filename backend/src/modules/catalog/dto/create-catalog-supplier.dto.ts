export class CreateCatalogSupplierDto {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  city?: string;
  state?: string;
  avgLeadTime?: number;
  notes?: string;
  active?: boolean;
}
