import { Allow } from 'class-validator';
import { TimelineEventType } from '../entities/timeline.entity';

export class CreateTimelineDto {
  @Allow()
  leadId: string;
  @Allow()
  type: TimelineEventType;
  @Allow()
  content: string;
  @Allow()
  metadata?: any;
}
