import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { LeadStage } from './entities/lead.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateLeadDto) {
    return this.leadsService.create(
      req.user.companyId,
      req.user.userId,
      dto,
      req.user.role,
    );
  }

  @Get()
  findAll(@Request() req, @Query('stage') stage?: LeadStage) {
    const scope = scopeFor(req.user);
    if (stage) {
      return this.leadsService.findByStage(scope.companyId, stage, scope.ownerUserId);
    }
    return this.leadsService.findAll(scope.companyId, scope.ownerUserId);
  }

  @Get('stats')
  getStats(@Request() req) {
    const scope = scopeFor(req.user);
    return this.leadsService.getStats(scope.companyId, scope.ownerUserId);
  }

  @Get('conversion')
  getConversion(@Request() req) {
    const scope = scopeFor(req.user);
    return this.leadsService.getConversionRate(scope.companyId, scope.ownerUserId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.leadsService.findOne(id, scope.companyId, scope.ownerUserId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto, @Request() req) {
    const scope = scopeFor(req.user);
    return this.leadsService.update(id, scope.companyId, dto, scope.ownerUserId);
  }

  @Patch(':id/stage')
  updateStage(
    @Param('id') id: string,
    @Body() body: { stage: LeadStage },
    @Request() req,
  ) {
    const scope = scopeFor(req.user);
    return this.leadsService.updateStage(
      id,
      scope.companyId,
      body.stage,
      req.user.userId,
      scope.ownerUserId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.leadsService.remove(id, scope.companyId, scope.ownerUserId);
  }
}
