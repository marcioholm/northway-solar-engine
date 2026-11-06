import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ProposalSettingsController } from './proposal-settings.controller';
import { ProposalSettingsService } from './proposal-settings.service';
import { SupabaseService } from '../../supabase/supabase.service';

describe('ProposalSettingsController', () => {
  let controller: ProposalSettingsController;
  let service: any;
  let supabase: any;

  beforeEach(async () => {
    service = {
      findByCompanyId: jest.fn().mockResolvedValue({ id: '1', template: 'moderno' }),
      update: jest.fn().mockResolvedValue({ id: '1', template: 'classico' }),
    };

    supabase = {
      uploadFile: jest.fn().mockResolvedValue({}),
      getPublicUrl: jest.fn().mockResolvedValue('https://storage/logo.png'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProposalSettingsController],
      providers: [
        { provide: ProposalSettingsService, useValue: service },
        { provide: SupabaseService, useValue: supabase },
      ],
    }).compile();

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
    await expect(controller.uploadImage(null as any, req)).rejects.toThrow(BadRequestException);
  });

  it('deve recusar upload com formato inválido', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const file = {
      mimetype: 'application/pdf',
      buffer: Buffer.from('test'),
    } as any;

    await expect(controller.uploadImage(file, req)).rejects.toThrow(
      'Formato inválido. Apenas imagens PNG, JPEG e WebP são permitidas',
    );
  });

  it('deve aceitar upload de imagem válida e retornar url pública', async () => {
    const req = { user: { companyId: 'comp-123' } };
    const file = {
      mimetype: 'image/png',
      buffer: Buffer.from('png-bytes'),
    } as any;

    const res = await controller.uploadImage(file, req);
    expect(res.url).toBe('https://storage/logo.png');
    expect(supabase.uploadFile).toHaveBeenCalled();
  });
});
