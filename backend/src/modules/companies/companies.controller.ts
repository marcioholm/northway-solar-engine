import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Logger,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import * as crypto from 'crypto';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { SupabaseService } from '../../supabase/supabase.service';
import { Company } from './entities/company.entity';
import { ImageOptimizerService } from '../proposal-settings/image-optimizer.service';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const LOGO_EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('companies')
export class CompaniesController {
  private readonly logger = new Logger(CompaniesController.name);
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly supabase: SupabaseService,
    private readonly imageOptimizer: ImageOptimizerService,
  ) {}

  private assertSameCompany(id: string, user: { role: UserRole; companyId: string }) {
    if (user.role !== UserRole.SUPERADMIN && id !== user.companyId) {
      throw new ForbiddenException('You can only access your own company');
    }
  }

  /** O token do Meta só entra pela API; nunca volta em respostas. */
  private toResponse(company: Company) {
    const { metaAccessToken, ...safe } = company;
    return { ...safe, hasMetaAccessToken: Boolean(metaAccessToken) };
  }

  @Post(':id/logo')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('logo', { limits: { fileSize: MAX_LOGO_BYTES } }),
  )
  @ApiConsumes('multipart/form-data')
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    this.assertSameCompany(id, req.user);
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = LOGO_EXTENSIONS[file.mimetype];
    if (!ext) throw new BadRequestException('Logo must be PNG, JPEG or WebP');

    const optimized = await this.imageOptimizer.processImage(
      file.buffer,
      file.mimetype,
      'logo',
    );

    const path = `logos/${id}/logo-${crypto.randomUUID()}.${optimized.extension}`;
    await this.supabase.uploadFile('logos', path, optimized.buffer, optimized.mimetype);
    const publicUrl = await this.supabase.getPublicUrl('logos', path);
    if (publicUrl) {
      await this.companiesService.update(id, { logoUrl: publicUrl });
      this.logger.log(`Logo updated for company ${id}: ${publicUrl}`);
      return { logoUrl: publicUrl };
    }
    throw new Error('Failed to get public URL');
  }

  @Post()
  @Roles(UserRole.SUPERADMIN)
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.toResponse(await this.companiesService.create(createCompanyDto));
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  async findAll() {
    const companies = await this.companiesService.findAll();
    return companies.map((company) => this.toResponse(company));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    this.assertSameCompany(id, req.user);
    const company = await this.companiesService.findOne(id);
    if (!company) throw new NotFoundException('Company not found');
    return this.toResponse(company);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    this.assertSameCompany(id, req.user);
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/plan')
  @Roles(UserRole.SUPERADMIN)
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: { plan?: string; maxUsers?: number | null },
  ) {
    await this.companiesService.update(id, dto);
    const updated = await this.companiesService.findOne(id);
    return this.toResponse(updated!);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
