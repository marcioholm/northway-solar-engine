import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LeadStage {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  BILL_RECEIVED = 'bill_received',
  SIZED = 'sized',
  PROPOSAL_SENT = 'proposal_sent',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum ClientType {
  RESIDENTIAL = 'residential',
  COMMERCIAL = 'commercial',
  INDUSTRIAL = 'industrial',
  RURAL = 'rural',
}

@Entity('leads')
export class Lead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column()
  name: string;

  @Column({ name: 'company_name', nullable: true })
  companyName: string;

  @Column({ nullable: true })
  document: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  whatsapp: string;

  @Column()
  email: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  zipcode: string;

  @Column({ name: 'client_type', type: 'enum', enum: ClientType, default: ClientType.RESIDENTIAL })
  clientType: ClientType;

  @Column({ nullable: true })
  source: string;
  
  // ────────── META CONVERSIONS & UTM ──────────
  
  @Column({ name: 'utm_source', nullable: true })
  utmSource: string;

  @Column({ name: 'utm_medium', nullable: true })
  utmMedium: string;

  @Column({ name: 'utm_campaign', nullable: true })
  utmCampaign: string;

  @Column({ name: 'utm_content', nullable: true })
  utmContent: string;

  @Column({ name: 'utm_term', nullable: true })
  utmTerm: string;

  @Column({ nullable: true })
  fbclid: string;

  @Column({ name: 'landing_url', nullable: true })
  landingUrl: string;

  @Column({ nullable: true })
  referrer: string;

  @Column({ name: 'captured_at', type: 'timestamp', nullable: true })
  capturedAt: Date;

  // ────────── END META CONVERSIONS & UTM ──────────

  @Column({ name: 'monthly_consumption', type: 'float', nullable: true })
  monthlyConsumption: number;

  @Column({
    name: 'avg_monthly_bill',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  avgMonthlyBill: number;

  @Column({ nullable: true })
  utility: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: LeadStage, default: LeadStage.NEW })
  stage: LeadStage;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @Column({
    name: 'value',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  value: number;

  @Column({ name: 'lost_reason', nullable: true })
  lostReason: string;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
