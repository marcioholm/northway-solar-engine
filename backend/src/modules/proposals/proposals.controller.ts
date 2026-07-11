import { Controller, Post, Body, Get, Param, UseGuards, Request, Header } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(req.user.companyId, req.user.userId, createProposalDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req) {
    return this.proposalsService.findAll(req.user.companyId);
  }

  @Get('lead/:leadId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findByLead(@Param('leadId') leadId: string) {
    return this.proposalsService.findByLead(leadId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async downloadPdf(@Param('id') id: string) {
    const { html } = await this.proposalsService.generatePdf(id);
    return html;
  }
}
