jest.mock('puppeteer-core', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProposalsService } from './proposals.service';
import { Proposal } from './entities/proposal.entity';
import { ProposalEvent } from './entities/proposal-event.entity';
import { ProposalOption } from './entities/proposal-option.entity';
import { SolarEngineService } from '../solar-engine/solar-engine.service';
import { SolarProjectService } from '../solar-project/solar-project.service';
import { PricingEngineService } from '../pricing-engine/pricing-engine.service';
import { CompaniesService } from '../companies/companies.service';
import { LeadsService } from '../leads/leads.service';
import { ProposalSettingsService } from '../proposal-settings/proposal-settings.service';

describe('ProposalsService (equipamentos e cotações)', () => {
  let service: ProposalsService;
  let mockProposalsRepo: any;
  let mockOptionsRepo: any;

  beforeEach(async () => {
    mockProposalsRepo = {
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((p) => Promise.resolve({ id: 'p1', ...p })),
      create: jest.fn().mockImplementation((p) => p),
    };

    mockOptionsRepo = {
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(),
      save: jest.fn().mockImplementation((o) => Promise.resolve({ id: 'opt1', ...o })),
      create: jest.fn().mockImplementation((o) => o),
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProposalsService,
        {
          provide: getRepositoryToken(Proposal),
          useValue: mockProposalsRepo,
        },
        {
          provide: getRepositoryToken(ProposalEvent),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ProposalOption),
          useValue: mockOptionsRepo,
        },
        {
          provide: SolarEngineService,
          useValue: {},
        },
        {
          provide: SolarProjectService,
          useValue: {},
        },
        {
          provide: PricingEngineService,
          useValue: { calculate: jest.fn() },
        },
        {
          provide: CompaniesService,
          useValue: { findOne: jest.fn().mockResolvedValue({ id: 'c1', name: 'Empresa Teste' }) },
        },
        {
          provide: LeadsService,
          useValue: { findOne: jest.fn(), updateStage: jest.fn() },
        },
        {
          provide: ProposalSettingsService,
          useValue: {
            findByCompanyId: jest.fn().mockResolvedValue({
              template: 'moderno',
              primaryColor: '#0f766e',
              secondaryColor: '#f59e0b',
              aboutText: 'Sobre nós',
              stats: [],
              partnerLogos: [],
              brandLogos: [],
              includedItems: [],
              sectionsEnabled: {
                cover: true,
                about: true,
                stats: true,
                technical: true,
                equipment: true,
                financial: true,
                kit: true,
                warranties: true,
                partners: true,
                contact: true,
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ProposalsService>(ProposalsService);
  });

  it('proposta ligada a cotação preenche equipamentos na ausência de equipamentos no projeto', async () => {
    const mockProposal = {
      id: 'p1',
      companyId: 'c1',
      publicToken: 'token-cotacao-1',
      clientName: 'Cliente Cotação',
      clientCity: 'Curitiba',
      finalPrice: 15000,
      systemPowerKwp: 5.5,
      paybackYears: 4.2,
      createdAt: new Date(),
      solarProject: {
        id: 'proj1',
        clientName: 'Cliente Cotação',
        equipmentModules: [],
        equipmentInverters: [],
      },
      quote: {
        id: 'q1',
        supplierName: 'Fornecedor Confidencial Ltda',
        items: [
          {
            productType: 'module',
            productBrand: 'Canadian Solar',
            productModel: 'CS6W-550MS',
            quantity: 10,
          },
          {
            productType: 'inverter',
            productBrand: 'Growatt',
            productModel: 'MIN 5000TL-X',
            quantity: 1,
          },
        ],
      },
    };

    mockProposalsRepo.findOne.mockResolvedValue(mockProposal);

    const assembled = await service.assemble('p1', 'c1');
    expect(assembled.project?.equipmentModules).toEqual([
      { brand: 'Canadian Solar', model: 'CS6W-550MS', qty: 10 },
    ]);
    expect(assembled.project?.equipmentInverters).toEqual([
      { brand: 'Growatt', model: 'MIN 5000TL-X', qty: 1 },
    ]);

    // Testar renderização web
    const webResult = await service.render('p1', 'c1', 'web');
    const webData = JSON.parse(webResult.content as string);
    expect(webData.equipment).toEqual([
      { type: 'module', brand: 'Canadian Solar', model: 'CS6W-550MS', quantity: 10, power: undefined },
      { type: 'inverter', brand: 'Growatt', model: 'MIN 5000TL-X', quantity: 1, power: undefined },
    ]);

    // Testar renderização HTML público: não deve vazar custos, margem, lucro, documento ou fornecedor
    const htmlResult = await service.render('p1', 'c1', 'html');
    const html = htmlResult.content as string;

    expect(html).toContain('Canadian Solar');
    expect(html).toContain('CS6W-550MS');
    expect(html).toContain('Growatt');
    expect(html).toContain('MIN 5000TL-X');

    // Confere que dados sensíveis não vazam
    expect(html).not.toContain('Fornecedor Confidencial Ltda');
    expect(html).not.toContain('marginPct');
    expect(html).not.toContain('pricingProfit');
    expect(html).not.toContain('totalCost');
  });

  it('projeto com equipamentos próprios mantém esses dados e não usa os da cotação', async () => {
    const mockProposal = {
      id: 'p2',
      companyId: 'c1',
      publicToken: 'token-proprios',
      createdAt: new Date(),
      solarProject: {
        id: 'proj2',
        equipmentModules: [{ brand: 'JA Solar', model: 'JAM72S30', qty: 12 }],
        equipmentInverters: [{ brand: 'Solis', model: 'S5-GR1P5K', qty: 1 }],
      },
      quote: {
        id: 'q2',
        items: [
          { productType: 'module', productBrand: 'Marca Cotação', productModel: 'Modelo Cotação', quantity: 99 },
        ],
      },
    };

    mockProposalsRepo.findOne.mockResolvedValue(mockProposal);

    const assembled = await service.assemble('p2', 'c1');
    expect(assembled.project?.equipmentModules).toEqual([
      { brand: 'JA Solar', model: 'JAM72S30', qty: 12 },
    ]);
    expect(assembled.project?.equipmentInverters).toEqual([
      { brand: 'Solis', model: 'S5-GR1P5K', qty: 1 },
    ]);
  });

  it('proposta sem cotação continua gerando sem erro', async () => {
    const mockProposal = {
      id: 'p3',
      companyId: 'c1',
      publicToken: 'token-sem-cotacao',
      createdAt: new Date(),
      solarProject: {
        id: 'proj3',
        equipmentModules: null,
        equipmentInverters: null,
      },
      quote: null,
    };

    mockProposalsRepo.findOne.mockResolvedValue(mockProposal);

    const assembled = await service.assemble('p3', 'c1');
    expect(assembled.project).toBeDefined();
    expect(assembled.quote).toBeNull();

    const webResult = await service.render('p3', 'c1', 'web');
    expect(webResult.content).toBeDefined();

    const htmlResult = await service.render('p3', 'c1', 'html');
    expect(htmlResult.content).toBeDefined();
  });

  it('proposta sem condições de pagamento não mostra parcelas no HTML nem inventa valores', async () => {
    const mockProposal = {
      id: 'p-no-pay',
      companyId: 'c1',
      publicToken: 'token-no-pay',
      clientName: 'Cliente Sem Pagamento',
      finalPrice: 20000,
      createdAt: new Date(),
      solarProject: {
        id: 'proj-no-pay',
        // Sem paymentCashDiscount, paymentCardTax, etc.
      },
    };

    mockProposalsRepo.findOne.mockResolvedValue(mockProposal);

    const htmlResult = await service.render('p-no-pay', 'c1', 'html');
    const html = htmlResult.content as string;

    // Deve exibir valor total
    expect(html).toContain('20.000,00');
    // NÃO deve exibir cartões de parcelas nem padrões inventados no corpo da proposta
    const body = html.slice(html.indexOf('</head>'));
    expect(body).not.toContain('Cartão de Crédito');
    expect(body).not.toContain('Financiamento Solar');
    expect(body).not.toContain('12x');
    expect(body).not.toContain('60x');
    expect(body).not.toContain('À Vista (');

    // Testar renderização web
    const webResult = await service.render('p-no-pay', 'c1', 'web');
    const webData = JSON.parse(webResult.content as string);
    expect(webData.paymentCardInstallments).toBeUndefined();
    expect(webData.paymentFinanceInstallments).toBeUndefined();
  });

  it('proposta sem geração omite o gráfico e a métrica de geração e nenhum dado interno aparece', async () => {
    const mockProposal = {
      id: 'p-no-gen',
      companyId: 'c1',
      publicToken: 'token-no-gen',
      clientName: 'Cliente Sem Geracao',
      finalPrice: 20000,
      systemPowerKwp: 4.5,
      createdAt: new Date(),
      solarProject: {
        id: 'proj-no-gen',
        // sizingGenerationKwh ausente
      },
    };

    mockProposalsRepo.findOne.mockResolvedValue(mockProposal);

    const htmlResult = await service.render('p-no-gen', 'c1', 'html');
    const html = htmlResult.content as string;

    // NÃO deve conter o gráfico de geração mensal nem geração média
    expect(html).not.toContain('Geração Mensal Estimada');
    expect(html).not.toContain('kWh/mês');
    // Não deve inventar cálculo de potência x 125 (4.5 * 125 = 563)
    expect(html).not.toContain('563');

    // Confere que nenhum dado interno aparece
    expect(html).not.toContain('marginPct');
    expect(html).not.toContain('pricingProfit');
    expect(html).not.toContain('totalCost');
  });

  describe('Validação de Opções e Isolamento Multi-tenant (Fase 2)', () => {
    it('bloqueia criação ou atualização com mais de 3 opções (limite de 3 opções)', async () => {
      mockProposalsRepo.findOne.mockResolvedValue({ id: 'p1', companyId: 'c1' });

      const fourOptions: any = [
        { name: 'Kit 1', position: 1, recommended: true, finalPrice: 10000, systemPowerKwp: 3 },
        { name: 'Kit 2', position: 2, recommended: false, finalPrice: 15000, systemPowerKwp: 4 },
        { name: 'Kit 3', position: 3, recommended: false, finalPrice: 20000, systemPowerKwp: 5 },
        { name: 'Kit 4', position: 4, recommended: false, finalPrice: 25000, systemPowerKwp: 6 },
      ];

      await expect(service.updateOptions('p1', 'c1', fourOptions)).rejects.toThrow(
        'A proposta pode ter no máximo 3 opções de kit',
      );
    });

    it('bloqueia mais de 1 opção marcada como recomendada', async () => {
      mockProposalsRepo.findOne.mockResolvedValue({ id: 'p1', companyId: 'c1' });

      const twoRecommended: any = [
        { name: 'Kit 1', position: 1, recommended: true, finalPrice: 10000, systemPowerKwp: 3 },
        { name: 'Kit 2', position: 2, recommended: true, finalPrice: 15000, systemPowerKwp: 4 },
      ];

      await expect(service.updateOptions('p1', 'c1', twoRecommended)).rejects.toThrow(
        'Apenas uma opção pode ser marcada como recomendada',
      );
    });

    it('isola opções por empresa: empresa A não lê nem acessa opções da empresa B', async () => {
      mockProposalsRepo.findOne.mockImplementation(async ({ where }: any) => {
        if (where.companyId === 'company-A' && where.id === 'prop-1') {
          return { id: 'prop-1', companyId: 'company-A' };
        }
        return null; // Empresa B não acha proposta da Empresa A
      });

      // Tentativa da Empresa B acessar opções da proposta da Empresa A
      await expect(service.getOptions('prop-1', 'company-B')).rejects.toThrow(
        'Proposta não encontrada',
      );

      // Empresa A acessa com isolamento garantido no repository query
      mockOptionsRepo.find.mockResolvedValue([
        { id: 'opt-1', proposalId: 'prop-1', companyId: 'company-A', name: 'Kit 1' },
      ]);

      const result = await service.getOptions('prop-1', 'company-A');
      expect(mockOptionsRepo.find).toHaveBeenCalledWith({
        where: { proposalId: 'prop-1', companyId: 'company-A' },
        order: { position: 'ASC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].companyId).toBe('company-A');
    });
  });
});
