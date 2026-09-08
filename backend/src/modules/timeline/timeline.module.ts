import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimelineController } from './timeline.controller';
import { TimelineService } from './timeline.service';
import { Timeline } from './entities/timeline.entity';
import { Lead } from '../leads/entities/lead.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Timeline, Lead])],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [TimelineService],
})
export class TimelineModule {}
