import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from './entities/timeline.entity';
import { CreateTimelineDto } from './dto/create-timeline.dto';

@Injectable()
export class TimelineService {
    constructor(
        @InjectRepository(Timeline)
        private timelineRepository: Repository<Timeline>,
    ) { }

    create(userId: string, dto: CreateTimelineDto) {
        const event = this.timelineRepository.create({
            ...dto,
            createdBy: userId,
        });
        return this.timelineRepository.save(event);
    }

    findByLead(leadId: string) {
        return this.timelineRepository.find({
            where: { leadId },
            order: { createdAt: 'DESC' },
        });
    }
}
