import { Injectable, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

export type ProposalImageType = 'logo' | 'cover' | 'about' | 'partner' | 'brand';

export interface ImageSpec {
  maxWidth: number;
  maxHeight: number;
  recommendedWidth: number;
  recommendedHeight: number;
  ratioLabel: string;
  idealFormat: string;
}

export const IMAGE_SPECS: Record<ProposalImageType, ImageSpec> = {
  logo: {
    maxWidth: 1000,
    maxHeight: 300,
    recommendedWidth: 1000,
    recommendedHeight: 300,
    ratioLabel: '10:3',
    idealFormat: 'PNG (com transparência) ou WebP',
  },
  cover: {
    maxWidth: 1240,
    maxHeight: 1754,
    recommendedWidth: 1240,
    recommendedHeight: 1754,
    ratioLabel: '1:1.41 (A4 vertical)',
    idealFormat: 'JPEG ou WebP',
  },
  about: {
    maxWidth: 1200,
    maxHeight: 800,
    recommendedWidth: 1200,
    recommendedHeight: 800,
    ratioLabel: '3:2',
    idealFormat: 'JPEG ou WebP',
  },
  partner: {
    maxWidth: 600,
    maxHeight: 300,
    recommendedWidth: 600,
    recommendedHeight: 300,
    ratioLabel: '2:1',
    idealFormat: 'PNG (com transparência) ou WebP',
  },
  brand: {
    maxWidth: 600,
    maxHeight: 300,
    recommendedWidth: 600,
    recommendedHeight: 300,
    ratioLabel: '2:1',
    idealFormat: 'PNG (com transparência) ou WebP',
  },
};

export interface ProcessedImageResult {
  buffer: Buffer;
  mimetype: string;
  extension: string;
  width: number;
  height: number;
  hasAlpha: boolean;
}

@Injectable()
export class ImageOptimizerService {
  normalizeType(type?: string): ProposalImageType {
    if (!type) {
      throw new BadRequestException(
        'Tipo de imagem não informado. Tipos permitidos: logo, cover, about, partner, brand',
      );
    }
    const lower = String(type).trim().toLowerCase();
    const map: Record<string, ProposalImageType> = {
      logo: 'logo',
      cover: 'cover',
      capa: 'cover',
      about: 'about',
      sobre: 'about',
      partner: 'partner',
      parceiro: 'partner',
      parceiros: 'partner',
      brand: 'brand',
      marca: 'brand',
      marcas: 'brand',
    };
    const resolved = map[lower];
    if (!resolved) {
      throw new BadRequestException(
        `Tipo de imagem inválido: "${type}". Tipos permitidos: logo, cover, about, partner, brand`,
      );
    }
    return resolved;
  }

  async processImage(
    buffer: Buffer,
    mimetype: string,
    type: ProposalImageType,
  ): Promise<ProcessedImageResult> {
    const spec = IMAGE_SPECS[type];
    if (!spec) {
      throw new BadRequestException(`Especificação não encontrada para tipo: ${type}`);
    }

    let pipeline: sharp.Sharp;
    let metadata: sharp.Metadata;
    try {
      pipeline = sharp(buffer);
      metadata = await pipeline.metadata();
    } catch (err: any) {
      throw new BadRequestException(`Arquivo de imagem inválido ou corrompido: ${err.message}`);
    }

    // 1. Corrigir rotação da foto (orientação baseada em EXIF)
    pipeline = pipeline.rotate();

    // 2. Redimensionar até o tamanho máximo do tipo, sem ampliar e mantendo proporção
    pipeline = pipeline.resize({
      width: spec.maxWidth,
      height: spec.maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    });

    // 3. Remover metadados (como localização): sharp por padrão descarta EXIF/GPS se .withMetadata() não for chamado.

    // 4. Manter transparência em PNG e WebP / Converter fotos sem transparência para WebP (qualidade 82)
    const hasAlpha = Boolean(metadata.hasAlpha);
    let outputMimetype: string;
    let outputExtension: string;

    if (hasAlpha) {
      if (metadata.format === 'webp' || mimetype === 'image/webp') {
        pipeline = pipeline.webp({ quality: 82, alphaQuality: 100 });
        outputMimetype = 'image/webp';
        outputExtension = 'webp';
      } else {
        // Manter PNG transparente
        pipeline = pipeline.png({ compressionLevel: 8 });
        outputMimetype = 'image/png';
        outputExtension = 'png';
      }
    } else {
      // Foto sem transparência: converter para WebP com qualidade 82
      pipeline = pipeline.webp({ quality: 82 });
      outputMimetype = 'image/webp';
      outputExtension = 'webp';
    }

    const { data: outputBuffer, info } = await pipeline.toBuffer({
      resolveWithObject: true,
    });

    return {
      buffer: outputBuffer,
      mimetype: outputMimetype,
      extension: outputExtension,
      width: info.width,
      height: info.height,
      hasAlpha: Boolean(info.channels === 4 || hasAlpha),
    };
  }
}
