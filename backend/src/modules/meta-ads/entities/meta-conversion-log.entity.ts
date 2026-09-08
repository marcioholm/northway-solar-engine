import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('meta_conversion_logs')
export class MetaConversionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @Column({ name: 'event_name' })
  eventName: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column()
  status: string; // queued, sent, failed

  @Column({ type: 'jsonb', nullable: true })
  response: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
