import {
  Controller,
  Post,
  Put,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Header,
  Query,
  NotFoundException,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import {
  CalculateScenariosDto,
  GenerateProposalDto,
  ProposalOptionDto,
  UpdateProposalOptionsDto,
} from './dto/proposal-option.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';

@ApiTags('proposals')
@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  create(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(
      req.user.companyId,
      req.user.userId,
      createProposalDto,
    );
  }

  @Post('generate/:projectId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  generate(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto?: GenerateProposalDto,
  ) {
    return this.proposalsService.generate(
      projectId,
      req.user.companyId,
      req.user.userId,
      dto,
    );
  }

  @Post('scenarios/:projectId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  calculateScenarios(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto?: CalculateScenariosDto,
  ) {
    return this.proposalsService.calculateProjectScenarios(
      projectId,
      req.user.companyId,
      dto?.futureLoads,
    );
  }

  @Get(':id/options')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getOptions(@Param('id') id: string, @Request() req) {
    return this.proposalsService.getOptions(id, req.user.companyId);
  }

  @Put(':id/options')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  updateOptions(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateProposalOptionsDto,
  ) {
    return this.proposalsService.updateOptions(id, req.user.companyId, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.proposalsService.findAll(req.user.companyId, page, limit);
  }

  @Get('lead/:leadId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    return this.proposalsService.findByLead(leadId, req.user.companyId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'html', 'web'] })
  async findOne(@Param('id') id: string, @Request() req, @Query('format') format?: string) {
    if (format === 'html') {
      const result = await this.proposalsService.render(id, req.user.companyId, 'html');
      return result.content;
    }
    if (format === 'web') {
      const result = await this.proposalsService.render(id, req.user.companyId, 'web');
      return JSON.parse(result.content as string);
    }
    return this.proposalsService.findOne(id, req.user.companyId);
  }

  @Get('public/:token')
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'html', 'web'] })
  async findOnePublic(@Param('token') token: string, @Query('format') format?: string) {
    const proposal = await this.proposalsService.findByToken(token);
    if (!proposal) throw new NotFoundException('Proposal not found');

    await this.proposalsService.assertNotExpired(proposal);

    if (format === 'html') {
      const result = await this.proposalsService.render(proposal.id, proposal.companyId, 'html');
      return result.content;
    }
    // Rota sem login: só devolve campos liberados ao cliente final.
    return this.proposalsService.getPublicView(proposal);
  }

  @Get(':id/pdf')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async downloadPdf(@Param('id') id: string, @Request() req, @Res() res: Response) {
    const { content, filename } = await this.proposalsService.render(id, req.user.companyId, 'pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get('public/:token/pdf')
  @UseGuards(UserThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async downloadPdfPublic(@Param('token') token: string, @Res() res: Response) {
    const proposal = await this.proposalsService.findByToken(token);
    if (!proposal) throw new NotFoundException('Proposal not found');

    await this.proposalsService.assertNotExpired(proposal);

    const { content, filename } = await this.proposalsService.render(proposal.id, proposal.companyId, 'pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(content);
  }

  @Get(':id/events')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getEvents(@Param('id') id: string) {
    return this.proposalsService.getEvents(id);
  }
}
