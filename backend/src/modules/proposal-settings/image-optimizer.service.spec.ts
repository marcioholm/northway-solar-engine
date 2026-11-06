import { BadRequestException } from '@nestjs/common';
import sharp from 'sharp';
import { ImageOptimizerService } from './image-optimizer.service';

describe('ImageOptimizerService', () => {
  let service: ImageOptimizerService;

  beforeEach(() => {
    service = new ImageOptimizerService();
  });

  describe('normalizeType', () => {
    it('deve aceitar tipos válidos em inglês e aliases em português', () => {
      expect(service.normalizeType('logo')).toBe('logo');
      expect(service.normalizeType('cover')).toBe('cover');
      expect(service.normalizeType('capa')).toBe('cover');
      expect(service.normalizeType('about')).toBe('about');
      expect(service.normalizeType('sobre')).toBe('about');
      expect(service.normalizeType('partner')).toBe('partner');
      expect(service.normalizeType('parceiro')).toBe('partner');
      expect(service.normalizeType('brand')).toBe('brand');
      expect(service.normalizeType('marca')).toBe('brand');
    });

    it('deve recusar tipo ausente ou vazio com 400 (BadRequestException)', () => {
      expect(() => service.normalizeType(undefined)).toThrow(BadRequestException);
      expect(() => service.normalizeType('')).toThrow(BadRequestException);
    });

    it('deve recusar tipo inválido com 400 (BadRequestException)', () => {
      expect(() => service.normalizeType('executavel')).toThrow(BadRequestException);
      expect(() => service.normalizeType('foto_qualquer')).toThrow(BadRequestException);
    });
  });

  describe('processImage', () => {
    it('imagem grande é reduzida para caber no tamanho máximo sem estourar', async () => {
      // Criar imagem de 2000x1000 px
      const largeBuffer = await sharp({
        create: {
          width: 2000,
          height: 1000,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(largeBuffer, 'image/jpeg', 'about');

      // Spec 'about': max 1200x800
      expect(result.width).toBeLessThanOrEqual(1200);
      expect(result.height).toBeLessThanOrEqual(800);
      expect(result.width).toBe(1200);
      expect(result.height).toBe(600); // manteve a proporção 2:1 original
    });

    it('imagem pequena não é ampliada', async () => {
      // Criar imagem pequena de 250x120 px
      const smallBuffer = await sharp({
        create: {
          width: 250,
          height: 120,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(smallBuffer, 'image/jpeg', 'logo');

      // Spec 'logo' permite até 1000x300, mas a imagem não deve ser ampliada
      expect(result.width).toBe(250);
      expect(result.height).toBe(120);
    });

    it('PNG transparente continua transparente (preserva canal alfa)', async () => {
      // Criar PNG com transparência (4 canais RGBA com alfa = 0)
      const transparentBuffer = await sharp({
        create: {
          width: 400,
          height: 200,
          channels: 4,
          background: { r: 0, g: 0, b: 255, alpha: 0.5 },
        },
      })
        .png()
        .toBuffer();

      const result = await service.processImage(transparentBuffer, 'image/png', 'partner');

      expect(result.mimetype).toBe('image/png');
      expect(result.extension).toBe('png');
      expect(result.hasAlpha).toBe(true);

      const meta = await sharp(result.buffer).metadata();
      expect(meta.hasAlpha).toBe(true);
      expect(meta.channels).toBe(4);
    });

    it('foto sem transparência é convertida para WebP com qualidade 82', async () => {
      const opaqueBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      const result = await service.processImage(opaqueBuffer, 'image/jpeg', 'cover');

      expect(result.mimetype).toBe('image/webp');
      expect(result.extension).toBe('webp');

      const meta = await sharp(result.buffer).metadata();
      expect(meta.format).toBe('webp');
    });

    it('rejeita buffer inválido com 400 e mensagem amigável', async () => {
      const corrupted = Buffer.from('arquivo corrompido que nao e imagem');
      await expect(
        service.processImage(corrupted, 'image/jpeg', 'logo'),
      ).rejects.toThrow('Imagem inválida ou grande demais');
    });

    it('imagem acima do limite de pixels (limitInputPixels) → 400', async () => {
      // 7000 x 6000 = 42.000.000 pixels (> limite de 40.000.000)
      const hugeBuffer = await sharp({
        create: {
          width: 7000,
          height: 6000,
          channels: 3,
          background: { r: 10, g: 20, b: 30 },
        },
      })
        .jpeg()
        .toBuffer();

      await expect(
        service.processImage(hugeBuffer, 'image/jpeg', 'logo'),
      ).rejects.toThrow('Imagem inválida ou grande demais');
    });
  });
});

