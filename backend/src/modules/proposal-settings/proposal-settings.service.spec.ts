import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProposalSettingsService } from './proposal-settings.service';
import { ProposalSettings } from './entities/proposal-settings.entity';

describe('ProposalSettingsService', () => {
  let service: ProposalSettingsService;
  let repo: any;

  const mockSettings = {
    id: 'setting-1',
    companyId: 'company-1',
    template: 'moderno',
    primaryColor: '#FFB703',
    secondaryColor: '#0F172A',
    stats: [{ value: '+500', label: 'Projetos' }],
    partnerLogos: [],
    brandLogos: [],
    includedItems: ['Item 1'],
    contact: { phone: '123' },
    sectionsEnabled: { cover: true },
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((dto) => ({ id: 'new-id', ...dto })),
      save: jest.fn().mockImplementation((item) => Promise.resolve(item)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalSettingsService,
        {
          provide: getRepositoryToken(ProposalSettings),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<ProposalSettingsService>(ProposalSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar as configurações existentes da empresa', async () => {
    repo.findOne.mockResolvedValue(mockSettings);

    const result = await service.findByCompanyId('company-1');
    expect(result).toEqual(mockSettings);
    expect(repo.findOne).toHaveBeenCalledWith({ where: { companyId: 'company-1' } });
  });

  it('deve criar configurações padrão caso a empresa ainda não possua', async () => {
    repo.findOne.mockResolvedValue(null);

    const result = await service.findByCompanyId('company-new');
    expect(result.companyId).toBe('company-new');
    expect(result.template).toBe('moderno');
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
  });

  it('deve atualizar as configurações da empresa', async () => {
    repo.findOne.mockResolvedValue({ ...mockSettings });

    const updated = await service.update('company-1', {
      template: 'minimalista',
      primaryColor: '#00FF00',
    });

    expect(updated.template).toBe('minimalista');
    expect(updated.primaryColor).toBe('#00FF00');
    expect(repo.save).toHaveBeenCalled();
  });
});
