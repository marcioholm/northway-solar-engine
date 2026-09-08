import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('inventory_modules')
export class InventoryModuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column({ name: 'power_watt', type: 'int' })
  powerWatt: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
