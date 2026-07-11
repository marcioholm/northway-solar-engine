import { Controller, Post, Body, Get, Param, UseGuards, Request, Res } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('proposals')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) { }

  @Post()
  create(@Request() req, @Body() createProposalDto: CreateProposalDto) {
    return this.proposalsService.create(req.user.companyId, req.user.userId, createProposalDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.proposalsService.findAll(req.user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proposalsService.findOne(id);
  }

  @Get(':id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res) {
    const { buffer, filename } = await this.proposalsService.generatePdf(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
