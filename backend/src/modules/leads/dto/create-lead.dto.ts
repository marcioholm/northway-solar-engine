import { Allow } from 'class-validator';
import { ClientType } from '../entities/lead.entity';

export class CreateLeadDto {
  @Allow()
  name: string;
  @Allow()
  companyName?: string;
  @Allow()
  document?: string;
  @Allow()
  phone: string;
  @Allow()
  whatsapp?: string;
  @Allow()
  email: string;
  @Allow()
  city: string;
  @Allow()
  state: string;
  @Allow()
  address?: string;
  @Allow()
  zipcode?: string;
  @Allow()
  clientType?: ClientType;
  @Allow()
  source?: string;
  @Allow()
  monthlyConsumption?: number;
  @Allow()
  avgMonthlyBill?: number;
  @Allow()
  utility?: string;
  @Allow()
  notes?: string;
  @Allow()
  assignedTo?: string;
  @Allow()
  utmSource?: string;
  @Allow()
  utmMedium?: string;
  @Allow()
  utmCampaign?: string;
  @Allow()
  utmContent?: string;
  @Allow()
  utmTerm?: string;
  @Allow()
  fbclid?: string;
  @Allow()
  landingUrl?: string;
  @Allow()
  referrer?: string;
  @Allow()
  capturedAt?: Date;
}
