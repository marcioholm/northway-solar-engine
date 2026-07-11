import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Request, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { SupabaseService } from '../../supabase/supabase.service';

@ApiTags('companies')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('companies')
export class CompaniesController {
  private readonly logger = new Logger(CompaniesController.name);
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly supabase: SupabaseService,
  ) { }

  @Post(':id/logo')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('logo'))
  @ApiConsumes('multipart/form-data')
  async uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new Error('No file uploaded');
    const ext = file.originalname.split('.').pop() || 'png';
    const path = `logos/${id}/logo.${ext}`;
    await this.supabase.uploadFile('logos', path, file.buffer, file.mimetype);
    const publicUrl = await this.supabase.getPublicUrl('logos', path);
    if (publicUrl) {
      await this.companiesService.update(id, { logoUrl: publicUrl });
      this.logger.log(`Logo updated for company ${id}: ${publicUrl}`);
      return { logoUrl: publicUrl };
    }
    throw new Error('Failed to get public URL');
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesService.create(createCompanyDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companiesService.update(id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.companiesService.remove(id);
  }
}
