import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export enum TimelineEventType {
  NOTE = 'note',
  CALL = 'call',
  MESSAGE = 'message',
  STATUS_CHANGE = 'status_change',
  PROPOSAL = 'proposal',
  TASK = 'task',
  ATTACHMENT = 'attachment',
  SYSTEM = 'system',
}

@Entity('lead_timeline')
export class Timeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lead_id' })
  leadId: string;

  @Column({ type: 'enum', enum: TimelineEventType })
  type: TimelineEventType;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'created_by' })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
