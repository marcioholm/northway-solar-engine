import { LeadStage } from '../entities/lead.entity';

export class UpdateLeadDto {
    name?: string;
    companyName?: string;
    document?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    city?: string;
    state?: string;
    address?: string;
    zipcode?: string;
    clientType?: string;
    source?: string;
    monthlyConsumption?: number;
    avgMonthlyBill?: number;
    utility?: string;
    notes?: string;
    stage?: LeadStage;
    assignedTo?: string;
    value?: number;
    lostReason?: string;
}
