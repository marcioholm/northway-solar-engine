import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { SupabaseService } from '../../supabase/supabase.service';
import { ProposalSettingsService } from './proposal-settings.service';
import { ImageOptimizerService } from './image-optimizer.service';
import { UpdateProposalSettingsDto } from './dto/update-proposal-settings.dto';

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

@ApiTags('proposal-settings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('proposal-settings')
export class ProposalSettingsController {
  private readonly logger = new Logger(ProposalSettingsController.name);

  constructor(
    private readonly service: ProposalSettingsService,
    private readonly supabase: SupabaseService,
    private readonly imageOptimizer: ImageOptimizerService,
  ) {}

  @Get()
  async getSettings(@Request() req) {
    return this.service.findByCompanyId(req.user.companyId);
  }

  @Patch()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  async updateSettings(
    @Request() req,
    @Body() dto: UpdateProposalSettingsDto,
  ) {
    return this.service.update(req.user.companyId, dto);
  }

  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES },
    }),
  )
  @ApiConsumes('multipart/form-data')
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body('type') bodyType?: string,
    @Query('type') queryType?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    const ext = ALLOWED_MIME_TYPES[file.mimetype];
    if (!ext) {
      throw new BadRequestException(
        'Formato inválido. Apenas imagens PNG, JPEG e WebP são permitidas',
      );
    }

    const rawType = bodyType || queryType;
    const imageType = this.imageOptimizer.normalizeType(rawType);

    const processed = await this.imageOptimizer.processImage(
      file.buffer,
      file.mimetype,
      imageType,
    );

    const companyId = req.user.companyId;
    const filename = `${crypto.randomUUID()}.${processed.extension}`;
    const filePath = `proposals/${companyId}/${filename}`;

    try {
      await this.supabase.uploadFile(
        'logos',
        filePath,
        processed.buffer,
        processed.mimetype,
      );
      const publicUrl = await this.supabase.getPublicUrl('logos', filePath);
      return {
        url: publicUrl || `/storage/logos/${filePath}`,
        width: processed.width,
        height: processed.height,
        format: processed.extension,
      };
    } catch (err: any) {
      this.logger.warn(`Fallback de upload para storage local: ${err.message}`);
      return {
        url: `/storage/logos/${filePath}`,
        width: processed.width,
        height: processed.height,
        format: processed.extension,
      };
    }
  }
}
