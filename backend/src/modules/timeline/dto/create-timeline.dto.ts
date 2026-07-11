import { TimelineEventType } from '../entities/timeline.entity';

export class CreateTimelineDto {
    leadId: string;
    type: TimelineEventType;
    content: string;
    metadata?: any;
}
