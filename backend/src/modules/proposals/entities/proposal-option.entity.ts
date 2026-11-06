import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proposal } from './proposal.entity';

@Entity('proposal_options')
export class ProposalOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proposal_id' })
  proposalId: string;

  @ManyToOne(() => Proposal, (p) => p.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ type: 'int' })
  position: number;

  @Column({ length: 100, default: 'Kit 1' })
  name: string;

  @Column({ type: 'boolean', default: false })
  recommended: boolean;

  @Column({
    name: 'system_power_kwp',
    type: 'numeric',
    precision: 8,
    scale: 2,
    default: 0,
    transformer: {
      to: (value?: number) => (value != null ? value : 0),
      from: (value: string | number | null) => (value != null ? Number(value) : 0),
    },
  })
  systemPowerKwp: number;

  @Column({ name: 'module_qty', type: 'int', default: 0 })
  moduleQty: number;

  @Column({ name: 'module_desc', type: 'text', nullable: true })
  moduleDesc?: string;

  @Column({ name: 'inverter_desc', type: 'text', nullable: true })
  inverterDesc?: string;

  @Column({ name: 'structure_desc', type: 'text', nullable: true })
  structureDesc?: string;

  @Column({
    name: 'generation_monthly_kwh',
    type: 'numeric',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: {
      to: (value?: number | null) => (value != null ? value : null),
      from: (value: string | number | null) =>
        value != null && value !== '' ? Number(value) : null,
    },
  })
  generationMonthlyKwh?: number | null;

  @Column({
    name: 'final_price',
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value?: number) => (value != null ? value : 0),
      from: (value: string | number | null) => (value != null ? Number(value) : 0),
    },
  })
  finalPrice: number;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
