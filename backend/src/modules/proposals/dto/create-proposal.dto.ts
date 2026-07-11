export class CreateProposalDto {
    clientName: string;
    clientCep: string;
    city: string;
    consumption: number;
    leadId?: string;
    utility?: string;
    tariff?: number;
    profile?: string;
}
