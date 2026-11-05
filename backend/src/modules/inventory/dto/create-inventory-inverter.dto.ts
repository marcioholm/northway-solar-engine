import { Allow } from 'class-validator';
export class CreateInventoryInverterDto {
  @Allow()
  brand: string;
  @Allow()
  model: string;
  @Allow()
  nominalPowerKw: number;
  @Allow()
  cost: number;
  @Allow()
  active: boolean;
}
