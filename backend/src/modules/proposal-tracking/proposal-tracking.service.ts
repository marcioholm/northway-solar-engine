import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalTracking, TrackEventType } from './entities/proposal-tracking.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { ProposalTrackingStatsDto } from './dto/tracking-stats.dto';

@Injectable()
export class ProposalTrackingService {
  constructor(
    @InjectRepository(ProposalTracking)
    private repository: Repository<ProposalTracking>,
  ) {}

  async track(proposalId: string, dto: TrackEventDto, ip?: string, userAgent?: string): Promise<ProposalTracking> {
    const metadata: Record<string, any> = {
      ...(dto.metadata || {}),
    };
    if (dto.section) metadata.section = dto.section;
    if (dto.duration !== undefined) metadata.durationSeconds = dto.duration;

    const event = this.repository.create({
      proposalId,
      eventType: dto.eventType as TrackEventType,
      metadata,
      ipAddress: ip || '',
      userAgent: userAgent || '',
    });

    return this.repository.save(event);
  }

  async getStats(proposalId: string): Promise<ProposalTrackingStatsDto> {
    const events = await this.repository.find({
      where: { proposalId },
      order: { createdAt: 'ASC' },
    });

    const views = events.filter(e => e.eventType === 'view');
    const downloads = events.filter(e => e.eventType === 'download');
    const whatsappClicks = events.filter(e => e.eventType === 'whatsapp_click');
    const accepts = events.filter(e => e.eventType === 'accept');
    const changeRequests = events.filter(e => e.eventType === 'change_request');
    const sectionViews = events.filter(e => e.eventType === 'section_view');

    const totalDurationSeconds = views.reduce((sum, v) => sum + (v.metadata?.durationSeconds || 0), 0);
    const averageDurationSeconds = views.length > 0 ? Math.round(totalDurationSeconds / views.length) : 0;

    // Aggregate section data
    const sectionMap = new Map<string, { views: number; totalDurationSeconds: number }>();
    for (const sv of sectionViews) {
      const name = sv.metadata?.section || 'unknown';
      const entry = sectionMap.get(name) || { views: 0, totalDurationSeconds: 0 };
      entry.views++;
      entry.totalDurationSeconds += sv.metadata?.durationSeconds || 0;
      sectionMap.set(name, entry);
    }

    return {
      proposalId,
      firstView: views.length > 0 ? views[0].createdAt : null,
      lastView: views.length > 0 ? views[views.length - 1].createdAt : null,
      totalViews: views.length,
      totalDurationSeconds,
      averageDurationSeconds,
      downloads: downloads.length,
      whatsappClicks: whatsappClicks.length,
      accepts: accepts.length,
      changeRequests: changeRequests.length,
      sections: Array.from(sectionMap.entries()).map(([name, data]) => ({
        name,
        views: data.views,
        totalDurationSeconds: data.totalDurationSeconds,
      })),
    };
  }
}
