import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inventory_inverters')
export class InventoryInverterEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ name: 'nominal_power_kw', type: 'decimal', precision: 5, scale: 2 })
  nominalPowerKw: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
