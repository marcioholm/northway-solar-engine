import { Allow } from 'class-validator';
import { LeadStage } from '../entities/lead.entity';

export class UpdateLeadDto {
  @Allow()
  name?: string;
  @Allow()
  companyName?: string;
  @Allow()
  document?: string;
  @Allow()
  phone?: string;
  @Allow()
  whatsapp?: string;
  @Allow()
  email?: string;
  @Allow()
  city?: string;
  @Allow()
  state?: string;
  @Allow()
  address?: string;
  @Allow()
  zipcode?: string;
  @Allow()
  clientType?: string;
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
  stage?: LeadStage;
  @Allow()
  assignedTo?: string;
  @Allow()
  value?: number;
  @Allow()
  lostReason?: string;
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
