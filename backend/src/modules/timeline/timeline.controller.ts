import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TimelineService } from './timeline.service';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateTimelineDto) {
    return this.timelineService.create(req.user.companyId, req.user.userId, dto);
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    return this.timelineService.findByLead(leadId, req.user.companyId);
  }
}
