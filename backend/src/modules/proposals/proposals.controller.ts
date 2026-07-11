import { Controller, Post, Body, Get, Param, UseGuards, Request, Header, Query } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(req.user.companyId, req.user.userId, createProposalDto);
  }

  @Post('generate/:projectId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generate(@Request() req, @Param('projectId') projectId: string) {
    return this.proposalsService.generate(projectId, req.user.companyId, req.user.userId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.proposalsService.findAll(req.user.companyId, page, limit);
  }

  @Get('lead/:leadId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findByLead(@Param('leadId') leadId: string) {
    return this.proposalsService.findByLead(leadId);
  }

  @Get(':id')
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'html', 'web'] })
  async findOne(@Param('id') id: string, @Query('format') format?: string) {
    if (format === 'html') {
      const result = await this.proposalsService.render(id, 'html');
      return result.content;
    }
    if (format === 'web') {
      const result = await this.proposalsService.render(id, 'web');
      return JSON.parse(result.content);
    }
    return this.proposalsService.findOne(id);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async downloadPdf(@Param('id') id: string) {
    const { content } = await this.proposalsService.render(id, 'html');
    return content;
  }
}
