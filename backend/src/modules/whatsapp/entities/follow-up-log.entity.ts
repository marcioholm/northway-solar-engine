import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('follow_up_logs')
export class FollowUpLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @Column({ name: 'proposal_id', nullable: true })
  proposalId: string;

  @Column()
  trigger: string;

  @Column({ name: 'seller_id', nullable: true })
  sellerId: string;

  @Column({ name: 'is_to_client', default: false })
  isToClient: boolean;

  @Column()
  status: string; // queued, sent, failed

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
