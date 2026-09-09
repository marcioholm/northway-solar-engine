import { Controller, Get, Param, Patch, Body, Request, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { SupabaseAuthGuard } from '../../common/guards/supabase-auth.guard';

@Controller('projects')
@UseGuards(SupabaseAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  async findAll(@Request() req) {
    return this.projectsService.findAll(req.user.company_id);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.projectsService.findOne(req.user.company_id, id);
  }

  @Patch(':id/status')
  async updateStatus(@Request() req, @Param('id') id: string, @Body('status') status: string) {
    return this.projectsService.updateStatus(req.user.company_id, id, status, req.user.id);
  }
}
