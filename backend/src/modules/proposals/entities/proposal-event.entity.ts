import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Proposal } from './proposal.entity';

@Entity('proposal_events')
export class ProposalEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'proposal_id' })
  proposalId: string;

  @ManyToOne(() => Proposal)
  @JoinColumn({ name: 'proposal_id' })
  proposal: Proposal;

  @Column({ name: 'event_type' })
  eventType: string; // e.g., 'OPEN', 'VIEW_PRICING', 'VIEW_PAYBACK'

  @Column({ name: 'duration_seconds', type: 'int', default: 0 })
  durationSeconds: number;

  @Column({ name: 'user_agent', nullable: true })
  userAgent: string;

  @Column({ name: 'ip_address', nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
