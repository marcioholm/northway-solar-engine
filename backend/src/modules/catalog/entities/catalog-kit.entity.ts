import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('catalog_kits')
export class CatalogKit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    name: 'suggested_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  suggestedPrice: number;

  @Column({ type: 'jsonb', default: '[]' })
  items: Array<{ productId: string; qty: number }>;

  @Column({ type: 'jsonb', default: '[]' })
  services: Array<{ type: string; value: number }>;

  @Column({ default: true })
  active: boolean;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
