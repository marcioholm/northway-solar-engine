import { Allow } from 'class-validator';
export class CreateInventoryModuleDto {
  @Allow()
  brand: string;
  @Allow()
  model: string;
  @Allow()
  powerWatt: number;
  @Allow()
  cost: number;
  @Allow()
  active: boolean;
}
