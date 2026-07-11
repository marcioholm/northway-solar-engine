import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Proposal } from '../../proposals/entities/proposal.entity';

export type TrackEventType =
  | 'view'
  | 'download'
  | 'whatsapp_click'
  | 'accept'
  | 'change_request'
  | 'section_view';

@Entity('proposal_tracking')
@Index(['proposalId', 'eventType'])
export class ProposalTracking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'proposal_id' })
    proposalId: string;

    @ManyToOne(() => Proposal, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
    proposal: Proposal;

    @Column({ name: 'event_type', length: 32 })
    eventType: TrackEventType;

    @Column({ type: 'jsonb', default: {} })
    metadata: Record<string, any>;

    @Column({ name: 'ip_address', nullable: true, length: 45 })
    ipAddress: string;

    @Column({ name: 'user_agent', nullable: true, type: 'text' })
    userAgent: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
