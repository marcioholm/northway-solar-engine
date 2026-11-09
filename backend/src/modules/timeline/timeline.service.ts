import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Timeline } from './entities/timeline.entity';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { Lead } from '../leads/entities/lead.entity';

@Injectable()
export class TimelineService {
  constructor(
    @InjectRepository(Timeline)
    private timelineRepository: Repository<Timeline>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
  ) {}

  async create(companyId: string, userId: string, dto: CreateTimelineDto, ownerUserId?: string) {
    const where: any = { id: dto.leadId, companyId };
    if (ownerUserId) where.assignedTo = ownerUserId;
    const lead = await this.leadRepository.findOneBy(where);
    if (!lead) throw new NotFoundException('Lead not found');

    const event = this.timelineRepository.create({
      ...dto,
      createdBy: userId,
    });
    return this.timelineRepository.save(event);
  }

  async findByLead(leadId: string, companyId: string, ownerUserId?: string) {
    const where: any = { id: leadId, companyId };
    if (ownerUserId) where.assignedTo = ownerUserId;
    const lead = await this.leadRepository.findOneBy(where);
    if (!lead) throw new NotFoundException('Lead not found');

    return this.timelineRepository.find({
      where: { leadId },
      order: { createdAt: 'DESC' },
    });
  }
}
