import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { SolarProjectService } from './solar-project.service';
import { QuoteService } from './quote.service';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('solar-project')
@Controller('solar-project')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SolarProjectController {
  constructor(
    private readonly service: SolarProjectService,
    private readonly quoteService: QuoteService,
  ) {}

  // ── Project CRUD ──

  @Post()
  @ApiOperation({ summary: 'Create a new solar project' })
  create(@Request() req, @Body() dto: CreateSolarProjectDto) {
    return this.service.create(req.user.companyId, req.user.userId, dto, req.user.role);
  }

  @Get()
  @ApiOperation({ summary: 'List solar projects' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by client name',
  })
  @ApiQuery({ name: 'consultant', required: false })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default 50)',
  })
  findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('consultant') consultant?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const scope = scopeFor(req.user);
    return this.service.findAll(scope.companyId, {
      status,
      query: q,
      consultant,
      page,
      limit,
      ownerUserId: scope.ownerUserId,
    });
  }

  @Get('lead/:leadId')
  @ApiOperation({ summary: 'Get projects by lead' })
  findByLead(@Param('leadId') leadId: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.getByLead(leadId, scope.companyId, scope.ownerUserId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get solar project by id' })
  findOne(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.findOne(id, scope.companyId, scope.ownerUserId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update solar project fields or module' })
  update(@Param('id') id: string, @Body() dto: UpdateSolarProjectDto, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.update(id, scope.companyId, dto, scope.ownerUserId);
  }

  @Patch(':id/module/:module')
  @ApiOperation({
    summary:
      'Update a specific module (client, site, consumption, sizing, equipment, pricing, payment)',
  })
  updateModule(
    @Param('id') id: string,
    @Param('module') module: string,
    @Body() data: Record<string, any>,
    @Request() req,
  ) {
    const scope = scopeFor(req.user);
    return this.service.updateModule(id, scope.companyId, module, data, scope.ownerUserId);
  }

  @Patch(':id/advance')
  @ApiOperation({ summary: 'Advance to next status' })
  advanceStatus(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.advanceStatus(id, scope.companyId, scope.ownerUserId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Set specific status' })
  updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.updateStatus(id, scope.companyId, body.status, scope.ownerUserId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete solar project' })
  remove(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.service.remove(id, scope.companyId, scope.ownerUserId);
  }

  // ── Quotes ──

  @Post(':id/quotes')
  @ApiOperation({ summary: 'Create a quote for the project' })
  createQuote(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateQuoteDto,
  ) {
    const scope = scopeFor(req.user);
    return this.quoteService.create(id, scope.companyId, req.user.userId, dto, scope.ownerUserId);
  }

  @Get(':id/quotes')
  @ApiOperation({ summary: 'List quotes for the project' })
  findQuotes(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.quoteService.findByProject(id, scope.companyId, scope.ownerUserId);
  }

  @Patch(':id/quotes/:qid')
  @ApiOperation({ summary: 'Update a quote' })
  updateQuote(@Param('qid') qid: string, @Body() dto: UpdateQuoteDto, @Request() req) {
    const scope = scopeFor(req.user);
    return this.quoteService.update(qid, scope.companyId, dto, scope.ownerUserId);
  }

  @Patch(':id/quotes/:qid/select')
  @ApiOperation({
    summary: 'Select a quote for the project (deselects others)',
  })
  selectQuote(@Param('id') id: string, @Param('qid') qid: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.quoteService.select(id, scope.companyId, qid, scope.ownerUserId);
  }

  @Get(':id/quotes/selected')
  @ApiOperation({ summary: 'Get the selected quote for the project' })
  getSelectedQuote(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.quoteService.getSelected(id, scope.companyId, scope.ownerUserId);
  }

  @Delete(':id/quotes/:qid')
  @ApiOperation({ summary: 'Delete a quote' })
  removeQuote(@Param('qid') qid: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.quoteService.remove(qid, scope.companyId, scope.ownerUserId);
  }
}
