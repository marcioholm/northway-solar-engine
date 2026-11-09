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
import { scopeFor } from '../../common/utils/scope.util';

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
    const scope = scopeFor(req.user);
    return this.proposalsService.create(
      scope.companyId,
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
    const scope = scopeFor(req.user);
    return this.proposalsService.generate(
      projectId,
      scope.companyId,
      req.user.userId,
      dto,
      scope.ownerUserId,
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
    const scope = scopeFor(req.user);
    return this.proposalsService.calculateProjectScenarios(
      projectId,
      scope.companyId,
      dto?.futureLoads,
      scope.ownerUserId,
    );
  }

  @Get(':id/options')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  getOptions(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.proposalsService.getOptions(id, scope.companyId, scope.ownerUserId);
  }

  @Put(':id/options')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  updateOptions(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateProposalOptionsDto,
  ) {
    const scope = scopeFor(req.user);
    return this.proposalsService.updateOptions(id, scope.companyId, dto, scope.ownerUserId);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findAll(
    @Request() req,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const scope = scopeFor(req.user);
    return this.proposalsService.findAll(scope.companyId, page, limit, scope.ownerUserId);
  }

  @Get('lead/:leadId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.proposalsService.findByLead(leadId, scope.companyId, scope.ownerUserId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiQuery({ name: 'format', required: false, enum: ['json', 'html', 'web'] })
  async findOne(@Param('id') id: string, @Request() req, @Query('format') format?: string) {
    const scope = scopeFor(req.user);
    if (format === 'html') {
      const result = await this.proposalsService.render(id, scope.companyId, 'html', scope.ownerUserId);
      return result.content;
    }
    if (format === 'web') {
      const result = await this.proposalsService.render(id, scope.companyId, 'web', scope.ownerUserId);
      return JSON.parse(result.content as string);
    }
    return this.proposalsService.findOne(id, scope.companyId, scope.ownerUserId);
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
    const scope = scopeFor(req.user);
    const { content, filename } = await this.proposalsService.render(id, scope.companyId, 'pdf', scope.ownerUserId);
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
  getEvents(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.proposalsService.getEvents(id, scope.companyId, scope.ownerUserId);
  }
}
