import { Controller, Post, Body, Get, Param, UseGuards, Request, Header, Logger } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalsController {
  private readonly logger = new Logger(ProposalsController.name);
  constructor(private readonly proposalsService: ProposalsService) {}

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
  async findOne(@Param('id') id: string) {
    try {
      this.logger.log(`findOne: ${id}`);
      const result = await this.proposalsService.findOne(id);
      this.logger.log(`findOne result: ${result ? 'found' : 'null'}`);
      return result;
    } catch (err) {
      this.logger.error(`findOne error: ${err.message}`);
      try {
        const result = await this.proposalsService.findOnePublic(id);
        this.logger.log(`findOnePublic result: ${result ? 'found' : 'null'}`);
        return result;
      } catch (err2) {
        this.logger.error(`findOnePublic error: ${err2.message}`);
        throw err2;
      }
    }
  }

  @Get(':id/pdf')
  @Header('Content-Type', 'text/html; charset=utf-8')
  async downloadPdf(@Param('id') id: string) {
    this.logger.log(`downloadPdf: ${id}`);
    const { html } = await this.proposalsService.generatePdf(id);
    return html;
  }
}
