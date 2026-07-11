import { Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SolarProjectService } from './solar-project.service';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';

@ApiTags('solar-project')
@Controller('solar-project')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SolarProjectController {
    constructor(private readonly service: SolarProjectService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new solar project' })
    create(@Request() req, @Body() dto: CreateSolarProjectDto) {
        return this.service.create(req.user.companyId, req.user.userId, dto);
    }

    @Get()
    @ApiOperation({ summary: 'List all solar projects' })
    findAll(@Request() req) {
        return this.service.findAll(req.user.companyId);
    }

    @Get('lead/:leadId')
    @ApiOperation({ summary: 'Get projects by lead' })
    findByLead(@Param('leadId') leadId: string) {
        return this.service.getByLead(leadId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get solar project by id' })
    findOne(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update solar project (any module)' })
    update(@Param('id') id: string, @Body() dto: UpdateSolarProjectDto) {
        return this.service.update(id, dto);
    }

    @Patch(':id/module/:module')
    @ApiOperation({ summary: 'Update a specific module (client, consumption, site, sizing, equipment, pricing, payment)' })
    updateModule(@Param('id') id: string, @Param('module') module: string, @Body() data: Record<string, any>) {
        return this.service.updateModule(id, module, data);
    }

    @Patch(':id/status')
    @ApiOperation({ summary: 'Update project status' })
    updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
        return this.service.updateStatus(id, body.status);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete solar project' })
    remove(@Param('id') id: string) {
        return this.service.remove(id);
    }
}
