import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { ImageOptimizerService } from '../proposal-settings/image-optimizer.service';
import { UserRole } from '../users/entities/user.entity';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let companiesService: any;
  let supabase: any;
  let imageOptimizer: any;

  beforeEach(async () => {
    companiesService = {
      findOne: jest.fn().mockResolvedValue({ id: 'comp-1', name: 'Empresa 1' }),
      update: jest.fn().mockResolvedValue({ id: 'comp-1', logoUrl: 'https://storage/logo.png' }),
      findAll: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: 'comp-1' }),
      remove: jest.fn().mockResolvedValue({}),
    };

    supabase = {
      uploadFile: jest.fn().mockResolvedValue({}),
      getPublicUrl: jest.fn().mockResolvedValue('https://storage/logos/comp-1/logo.png'),
    };

    imageOptimizer = {
      processImage: jest.fn().mockResolvedValue({
        buffer: Buffer.from('optimized-bytes'),
        mimetype: 'image/png',
        extension: 'png',
        width: 800,
        height: 240,
        hasAlpha: true,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: companiesService },
        { provide: SupabaseService, useValue: supabase },
        { provide: ImageOptimizerService, useValue: imageOptimizer },
      ],
    }).compile();

    controller = module.get<CompaniesController>(CompaniesController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadLogo', () => {
    it('deve otimizar o logo com type logo, manter png para imagem com transparência e salvar no Supabase', async () => {
      const file = {
        buffer: Buffer.from('raw-png'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      const req = {
        user: { role: UserRole.ADMIN, companyId: 'comp-1' },
      };

      const result = await controller.uploadLogo('comp-1', file, req);

      expect(imageOptimizer.processImage).toHaveBeenCalledWith(
        file.buffer,
        'image/png',
        'logo',
      );
      expect(supabase.uploadFile).toHaveBeenCalledWith(
        'logos',
        expect.stringMatching(/^logos\/comp-1\/logo-[a-f0-9-]+\.png$/),
        Buffer.from('optimized-bytes'),
        'image/png',
      );
      expect(companiesService.update).toHaveBeenCalledWith('comp-1', {
        logoUrl: 'https://storage/logos/comp-1/logo.png',
      });
      expect(result).toEqual({ logoUrl: 'https://storage/logos/comp-1/logo.png' });
    });

    it('deve usar extensão webp e mimetype image/webp quando otimizador converter imagem sem transparência', async () => {
      imageOptimizer.processImage.mockResolvedValueOnce({
        buffer: Buffer.from('optimized-webp'),
        mimetype: 'image/webp',
        extension: 'webp',
        width: 1000,
        height: 300,
        hasAlpha: false,
      });
      supabase.getPublicUrl.mockResolvedValueOnce('https://storage/logos/comp-1/logo.webp');

      const file = {
        buffer: Buffer.from('raw-jpg'),
        mimetype: 'image/jpeg',
      } as Express.Multer.File;

      const req = {
        user: { role: UserRole.ADMIN, companyId: 'comp-1' },
      };

      const result = await controller.uploadLogo('comp-1', file, req);

      expect(imageOptimizer.processImage).toHaveBeenCalledWith(
        file.buffer,
        'image/jpeg',
        'logo',
      );
      expect(supabase.uploadFile).toHaveBeenCalledWith(
        'logos',
        expect.stringMatching(/^logos\/comp-1\/logo-[a-f0-9-]+\.webp$/),
        Buffer.from('optimized-webp'),
        'image/webp',
      );
      expect(result).toEqual({ logoUrl: 'https://storage/logos/comp-1/logo.webp' });
    });

    it('deve lançar BadRequestException se nenhum arquivo for enviado', async () => {
      const req = {
        user: { role: UserRole.ADMIN, companyId: 'comp-1' },
      };
      await expect(controller.uploadLogo('comp-1', null as any, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException se o formato do arquivo for inválido', async () => {
      const file = {
        buffer: Buffer.from('fake-pdf'),
        mimetype: 'application/pdf',
      } as Express.Multer.File;

      const req = {
        user: { role: UserRole.ADMIN, companyId: 'comp-1' },
      };

      await expect(controller.uploadLogo('comp-1', file, req)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve barrar upload para empresa diferente com ForbiddenException', async () => {
      const file = {
        buffer: Buffer.from('raw-png'),
        mimetype: 'image/png',
      } as Express.Multer.File;

      const req = {
        user: { role: UserRole.ADMIN, companyId: 'comp-1' },
      };

      await expect(controller.uploadLogo('comp-2', file, req)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
