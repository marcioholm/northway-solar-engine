import { ClientType } from '../entities/lead.entity';

export class CreateLeadDto {
    name: string;
    companyName?: string;
    document?: string;
    phone: string;
    whatsapp?: string;
    email: string;
    city: string;
    state: string;
    address?: string;
    zipcode?: string;
    clientType?: ClientType;
    source?: string;
    monthlyConsumption?: number;
    avgMonthlyBill?: number;
    utility?: string;
    notes?: string;
    assignedTo?: string;
}
