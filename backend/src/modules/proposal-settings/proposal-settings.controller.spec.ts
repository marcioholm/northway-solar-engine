import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProposalSettingsController } from './proposal-settings.controller';
import { ProposalSettingsService } from './proposal-settings.service';
import { ImageOptimizerService } from './image-optimizer.service';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserThrottlerGuard } from '../../common/guards/user-throttler.guard';

describe('ProposalSettingsController', () => {
  let controller: ProposalSettingsController;
  let service: any;
  let supabase: any;
  let optimizer: any;

  beforeEach(async () => {
    service = {
      findByCompanyId: jest.fn().mockResolvedValue({ id: '1', template: 'moderno' }),
      update: jest.fn().mockResolvedValue({ id: '1', template: 'classico' }),
    };

    supabase = {
      uploadFile: jest.fn().mockResolvedValue({}),
      getPublicUrl: jest.fn().mockResolvedValue('https://storage/logo.png'),
    };

    optimizer = {
      normalizeType: jest.fn((t) => {
        if (!t || t === 'invalido') throw new BadRequestException('Tipo inválido');
        return t;
      }),
      processImage: jest.fn().mockResolvedValue({
        buffer: Buffer.from('processed-bytes'),
        mimetype: 'image/webp',
        extension: 'webp',
        width: 1000,
        height: 300,
        hasAlpha: false,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalSettingsController],
      providers: [
        { provide: ProposalSettingsService, useValue: service },
        { provide: SupabaseService, useValue: supabase },
        { provide: ImageOptimizerService, useValue: optimizer },
      ],
    })
      .overrideGuard(UserThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProposalSettingsController>(ProposalSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve buscar as configurações da empresa do usuário autenticado', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const res = await controller.getSettings(req);
    expect(res).toEqual({ id: '1', template: 'moderno' });
    expect(service.findByCompanyId).toHaveBeenCalledWith('comp-123');
  });

  it('deve atualizar as configurações da empresa', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const res = await controller.updateSettings(req, { template: 'classico' });
    expect(res).toEqual({ id: '1', template: 'classico' });
    expect(service.update).toHaveBeenCalledWith('comp-123', { template: 'classico' });
  });

  it('deve recusar upload sem arquivo', async () => {
    const req = { user: { companyId: 'comp-123' } };
    await expect(controller.uploadImage(null as any, req, 'logo')).rejects.toThrow(BadRequestException);
  });

  it('deve recusar upload com formato inválido', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const file = {
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
    } as any;

    await expect(controller.uploadImage(file, req, 'logo')).rejects.toThrow(
      'Formato inválido. Apenas imagens PNG, JPEG e WebP são permitidas',
    );
  });

  it('deve recusar upload com tipo de imagem ausente ou inválido', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const file = {
      mimetype: 'image/png',
      buffer: Buffer.from('png-bytes'),
    } as any;

    await expect(controller.uploadImage(file, req, 'invalido')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('deve aceitar upload de imagem válida, otimizar com sharp e retornar url pública e dimensões', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const file = {
      mimetype: 'image/png',
      buffer: Buffer.from('png-bytes'),
    } as any;

    const res = await controller.uploadImage(file, req, 'cover');
    expect(res.url).toBe('https://storage/logo.png');
    expect(res.width).toBe(1000);
    expect(res.height).toBe(300);
    expect(res.format).toBe('webp');
    expect(optimizer.normalizeType).toHaveBeenCalledWith('cover');
    expect(optimizer.processImage).toHaveBeenCalledWith(file.buffer, 'image/png', 'cover');
    expect(supabase.uploadFile).toHaveBeenCalled();
  });
});
