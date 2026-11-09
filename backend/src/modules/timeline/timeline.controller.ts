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
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('timeline')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateTimelineDto) {
    const scope = scopeFor(req.user);
    return this.timelineService.create(scope.companyId, req.user.userId, dto, scope.ownerUserId);
  }

  @Get('lead/:leadId')
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.timelineService.findByLead(leadId, scope.companyId, scope.ownerUserId);
  }
}
