import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthGuard } from '@nestjs/passport';
import { LeadStage } from './entities/lead.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateLeadDto) {
        return this.leadsService.create(req.user.companyId, req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req, @Query('stage') stage?: LeadStage) {
        if (stage) {
            return this.leadsService.findByStage(req.user.companyId, stage);
        }
        return this.leadsService.findAll(req.user.companyId);
    }

    @Get('stats')
    getStats(@Request() req) {
        return this.leadsService.getStats(req.user.companyId);
    }

    @Get('conversion')
    getConversion(@Request() req) {
        return this.leadsService.getConversionRate(req.user.companyId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.leadsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
        return this.leadsService.update(id, dto);
    }

    @Patch(':id/stage')
    updateStage(@Param('id') id: string, @Body() body: { stage: LeadStage }, @Request() req) {
        return this.leadsService.updateStage(id, body.stage, req.user.userId);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.leadsService.remove(id);
    }
}
