import { Allow } from 'class-validator';
export class CreateProposalDto {
  @Allow()
  clientName: string;
  @Allow()
  clientCep: string;
  @Allow()
  city: string;
  @Allow()
  consumption: number;
  @Allow()
  leadId?: string;
  @Allow()
  utility?: string;
  @Allow()
  tariff?: number;
  @Allow()
  profile?: string;
  @Allow()
  moduleId?: string;
  @Allow()
  inverterId?: string;
  @Allow()
  moduleQty?: number;
  @Allow()
  expiresAt?: string;
}
