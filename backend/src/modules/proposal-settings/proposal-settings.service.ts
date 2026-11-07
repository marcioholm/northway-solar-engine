import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QR from 'qrcode';
import {
  DEFAULT_FUTURE_LOADS,
  DEFAULT_SIZING_RULES,
  ProposalSettings,
} from './entities/proposal-settings.entity';
import { UpdateProposalSettingsDto } from './dto/update-proposal-settings.dto';
import { PreviewPdfDto } from './dto/preview-pdf.dto';
import { Company } from '../companies/entities/company.entity';
import { Proposal } from '../proposals/entities/proposal.entity';
import { SolarProject } from '../solar-project/entities/solar-project.entity';
import { ProposalHtmlRenderer } from '../proposals/renderers/proposal-html.renderer';
import { ProposalPdfRenderer } from '../proposals/renderers/proposal-pdf.renderer';
import { ProposalAssembledData } from '../proposals/renderers/proposal-renderer.interface';
import {
  calculateScenarios,
  validateAndEnrichFutureLoads,
} from '../proposals/utils/scenario-calculator';
import {
  calculateOptionPayment,
  PaymentConfig,
} from '../proposals/utils/payment-calculator';
import { DEFAULT_LABEL } from '../proposals/templates/qr-target';

const DEFAULT_ABOUT_TEXT =
  'Somos especialistas em soluções completas de energia solar fotovoltaica, dedicados a entregar máxima economia, sustentabilidade e segurança para residências, comércios e propriedades rurais.';

const DEFAULT_STATS = [
  { value: '+500', label: 'Projetos Realizados' },
  { value: '99%', label: 'Clientes Satisfeitos' },
  { value: '25 anos', label: 'Garantia de Geração' },
  { value: 'Até 95%', label: 'Economia na Conta' },
];

const DEFAULT_INCLUDED_ITEMS = [
  'Módulos fotovoltaicos de alta eficiência (tecnologia TOPCon / N-Type)',
  'Inversor ou microinversores com monitoramento Wi-Fi integrado',
  'Estrutura completa de fixação em alumínio anodizado de alta durabilidade',
  'Cabos solares especiais com proteção UV e conectores MC4 originais',
  'Quadro de proteção CA/CC com disjuntores e DPS para máxima segurança',
  'Projeto elétrico de engenharia com emissão de ART',
  'Tramitação documental e aprovação de parecer de acesso junto à concessionária',
  'Montagem técnica, comissionamento e ativação do sistema',
];

const DEFAULT_WARRANTIES_TEXT =
  'Garantia de 25 anos de performance linear nos módulos fotovoltaicos (com pelo menos 80% da potência nominal garantida no 25º ano). Garantia de 10 a 12 anos contra defeitos de fabricação dos módulos solares. Garantia de 5 a 10 anos para inversores, conforme termo de garantia do fabricante. Garantia de 1 ano para os serviços de instalação e conformidade elétrica prestados pela nossa equipe.';

const DEFAULT_EXCLUSIONS_TEXT =
  'Não estão inclusos no escopo deste fornecimento: reformas prévias ou reforço estrutural em telhados ou vigamentos danificados; obras de alvenaria, furações pesadas ou cabeamento civil além do padrão de instalação solar; adequações ou substituição do padrão de entrada de energia (poste, caixa e cabos) caso venham a ser exigidas pela concessionária em vistoria prévia.';

const DEFAULT_NOTES_TEXT =
  'Proposta válida por 10 (dez) dias corridos a partir da data de envio. A geração energética e economia financeira calculadas são estimativas baseadas em dados históricos de irradiação solar e hábitos médios de consumo. Os prazos de vistoria, troca de medidor para modelo bidirecional e homologação final são de responsabilidade da distribuidora de energia local.';

const DEFAULT_ACCEPTANCE_TEXT =
  'Ao assinar ou dar aceite eletrônico nesta proposta, o cliente declara concordar com o dimensionamento técnico, valores e condições comerciais apresentadas, autorizando a empresa a dar início aos trâmites de engenharia e homologação.';

const DEFAULT_SECTIONS_ENABLED = {
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
};

@Injectable()
export class ProposalSettingsService {
  private readonly logger = new Logger(ProposalSettingsService.name);
  private readonly htmlRenderer = new ProposalHtmlRenderer();
  private readonly pdfRenderer = new ProposalPdfRenderer(this.htmlRenderer);

  constructor(
    @InjectRepository(ProposalSettings)
    private readonly repo: Repository<ProposalSettings>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly configService: ConfigService,
  ) {}

  async findByCompanyId(companyId: string): Promise<ProposalSettings> {
    let settings = await this.repo.findOne({ where: { companyId } });
    if (!settings) {
      settings = this.repo.create({
        companyId,
        template: 'moderno',
        primaryColor: '#1F2937',
        secondaryColor: '#F59E0B',
        coverFocus: 'center',
        aboutText: DEFAULT_ABOUT_TEXT,
        stats: DEFAULT_STATS,
        highlights: [],
        partnerLogos: [],
        brandLogos: [],
        serviceArea: {
          style: 'zoom',
          states: [],
          cities: [],
        },
        serviceAreaText:
          'Atendimento especializado em todo o estado com suporte técnico de excelência e equipe própria.',
        includedItems: DEFAULT_INCLUDED_ITEMS,
        warrantiesText: DEFAULT_WARRANTIES_TEXT,
        exclusionsText: DEFAULT_EXCLUSIONS_TEXT,
        notesText: DEFAULT_NOTES_TEXT,
        acceptanceText: DEFAULT_ACCEPTANCE_TEXT,
        qr: {
          enabled: true,
          type: 'proposal',
          value: '',
          message: '',
          label: '',
        },
        contact: {
          address: '',
          phone: '',
          website: '',
          instagram: '',
          whatsapp: '',
        },
        sectionsEnabled: DEFAULT_SECTIONS_ENABLED,
        sizingRules: DEFAULT_SIZING_RULES,
        futureLoads: DEFAULT_FUTURE_LOADS,
      });
      settings = await this.repo.save(settings);
    } else {
      if (!settings.sizingRules || Object.keys(settings.sizingRules).length === 0) {
        settings.sizingRules = DEFAULT_SIZING_RULES;
      }
      if (!settings.futureLoads || settings.futureLoads.length === 0) {
        settings.futureLoads = DEFAULT_FUTURE_LOADS;
      }
    }
    return settings;
  }

  private validateSupabaseImageUrl(
    url: string,
    companyId: string,
    field: string,
  ): void {
    if (typeof url !== 'string' || !url.trim()) {
      throw new BadRequestException(
        `A URL informada para ${field} é inválida`,
      );
    }

    let parsed: URL;
    try {
      parsed = new URL(url.trim());
    } catch {
      throw new BadRequestException(
        `A URL informada para ${field} é malformada`,
      );
    }

    if (parsed.protocol !== 'https:') {
      throw new BadRequestException(
        `A URL em ${field} deve utilizar o protocolo HTTPS`,
      );
    }

    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    if (supabaseUrl) {
      try {
        const expectedHost = new URL(supabaseUrl).hostname.toLowerCase();
        if (parsed.hostname.toLowerCase() !== expectedHost) {
          throw new BadRequestException(
            `A URL em ${field} deve pertencer ao Supabase da aplicação`,
          );
        }
      } catch {
        if (!parsed.hostname.toLowerCase().endsWith('supabase.co')) {
          throw new BadRequestException(
            `A URL em ${field} deve pertencer ao Supabase da aplicação`,
          );
        }
      }
    } else {
      if (!parsed.hostname.toLowerCase().endsWith('supabase.co')) {
        throw new BadRequestException(
          `A URL em ${field} deve pertencer ao Supabase da aplicação`,
        );
      }
    }

    const expectedPrefix = `/storage/v1/object/public/logos/proposals/${companyId}/`;
    if (!parsed.pathname.startsWith(expectedPrefix)) {
      throw new BadRequestException(
        `A URL em ${field} deve ser do bucket logos no caminho proposals/${companyId}/`,
      );
    }

    const filename = parsed.pathname.slice(expectedPrefix.length);
    if (!filename || filename.trim().length === 0) {
      throw new BadRequestException(
        `A URL em ${field} deve conter o arquivo no caminho proposals/${companyId}/`,
      );
    }
  }

  async update(
    companyId: string,
    dto: UpdateProposalSettingsDto,
  ): Promise<ProposalSettings> {
    const settings = await this.findByCompanyId(companyId);

    // Validação de URLs de imagens
    if (
      dto.coverImageUrl !== undefined &&
      dto.coverImageUrl !== null &&
      dto.coverImageUrl.trim() !== ''
    ) {
      this.validateSupabaseImageUrl(dto.coverImageUrl, companyId, 'coverImageUrl');
    }

    if (
      dto.aboutImageUrl !== undefined &&
      dto.aboutImageUrl !== null &&
      dto.aboutImageUrl.trim() !== ''
    ) {
      this.validateSupabaseImageUrl(dto.aboutImageUrl, companyId, 'aboutImageUrl');
    }

    if (
      dto.kitImageUrl !== undefined &&
      dto.kitImageUrl !== null &&
      dto.kitImageUrl.trim() !== ''
    ) {
      this.validateSupabaseImageUrl(dto.kitImageUrl, companyId, 'kitImageUrl');
    }

    if (dto.partnerLogos !== undefined && Array.isArray(dto.partnerLogos)) {
      for (const logoUrl of dto.partnerLogos) {
        this.validateSupabaseImageUrl(logoUrl, companyId, 'partnerLogos');
      }
    }

    if (dto.brandLogos !== undefined && Array.isArray(dto.brandLogos)) {
      for (const logoUrl of dto.brandLogos) {
        this.validateSupabaseImageUrl(logoUrl, companyId, 'brandLogos');
      }
    }

    // Apply fields from DTO
    if (dto.template !== undefined) settings.template = dto.template;
    if (dto.primaryColor !== undefined) settings.primaryColor = dto.primaryColor;
    if (dto.secondaryColor !== undefined)
      settings.secondaryColor = dto.secondaryColor;
    if (dto.coverImageUrl !== undefined)
      settings.coverImageUrl = dto.coverImageUrl;
    if (dto.coverFocus !== undefined)
      settings.coverFocus = dto.coverFocus;
    if (dto.aboutText !== undefined) settings.aboutText = dto.aboutText;
    if (dto.aboutImageUrl !== undefined)
      settings.aboutImageUrl = dto.aboutImageUrl;
    if (dto.stats !== undefined) settings.stats = dto.stats;
    if (dto.highlights !== undefined) settings.highlights = dto.highlights;
    if (dto.partnerLogos !== undefined) settings.partnerLogos = dto.partnerLogos;
    if (dto.brandLogos !== undefined) settings.brandLogos = dto.brandLogos;
    if (dto.serviceArea !== undefined)
      settings.serviceArea = dto.serviceArea as any;
    if (dto.serviceAreaText !== undefined)
      settings.serviceAreaText = dto.serviceAreaText;
    if (dto.includedItems !== undefined)
      settings.includedItems = dto.includedItems;
    if (dto.kitImageUrl !== undefined)
      settings.kitImageUrl = dto.kitImageUrl;
    if (dto.servicesText !== undefined)
      settings.servicesText = dto.servicesText;
    if (dto.warrantiesText !== undefined)
      settings.warrantiesText = dto.warrantiesText;
    if (dto.exclusionsText !== undefined)
      settings.exclusionsText = dto.exclusionsText;
    if (dto.notesText !== undefined) settings.notesText = dto.notesText;
    if (dto.acceptanceText !== undefined)
      settings.acceptanceText = dto.acceptanceText;
    if (dto.qr !== undefined)
      settings.qr = dto.qr as any;
    if (dto.contact !== undefined) {
      settings.contact = {
        ...settings.contact,
        ...dto.contact,
      };
    }
    if (dto.sectionsEnabled !== undefined) {
      settings.sectionsEnabled = {
        ...settings.sectionsEnabled,
        ...dto.sectionsEnabled,
      };
    }
    if (dto.paymentDefaults !== undefined) {
      settings.paymentDefaults = dto.paymentDefaults as any;
    }
    if (dto.sizingRules !== undefined) {
      settings.sizingRules = {
        ...settings.sizingRules,
        ...dto.sizingRules,
      } as any;
    }
    if (dto.futureLoads !== undefined) {
      settings.futureLoads = dto.futureLoads as any;
    }

    return this.repo.save(settings);
  }

  async generatePreviewPdf(
    companyId: string,
    dto?: PreviewPdfDto,
  ): Promise<Buffer> {
    const settings = await this.findByCompanyId(companyId);
    const company = await this.companyRepo.findOne({ where: { id: companyId } });

    const consumptionMonthlyKwh =
      dto?.consumptionKwh != null
        ? Math.max(100, Math.min(20000, Number(dto.consumptionKwh)))
        : 850;

    const generationFactor = 130;
    const basePowerKwp = consumptionMonthlyKwh / generationFactor;
    const baseGenerationKwh = consumptionMonthlyKwh;
    const modulePowerWatt = 550;

    const catalog =
      settings.futureLoads && settings.futureLoads.length > 0
        ? settings.futureLoads
        : DEFAULT_FUTURE_LOADS;

    const validatedFutureLoads = validateAndEnrichFutureLoads(
      dto?.futureLoads,
      catalog,
    );

    const scenarioResult = calculateScenarios({
      consumptionMonthlyKwh,
      sizingPowerKwp: basePowerKwp,
      sizingGenerationKwh: baseGenerationKwh,
      modulePowerWatt,
      sizingRules: settings.sizingRules,
      futureLoads: validatedFutureLoads,
    });

    const EXAMPLE_PRICE_PER_KWP = 3400;

    const paymentConfig: PaymentConfig = {
      cashDiscountPct: settings.paymentDefaults?.cashDiscountPct,
      card: settings.paymentDefaults?.card,
      finance: settings.paymentDefaults?.finance,
      own: settings.paymentDefaults?.own,
    };

    const templateOptions = scenarioResult.scenarios.map((sc) => {
      const optPrice = Math.round(sc.systemPowerKwp * EXAMPLE_PRICE_PER_KWP);
      const coverage =
        consumptionMonthlyKwh > 0 && sc.generationMonthlyKwh > 0
          ? Math.min(sc.generationMonthlyKwh / consumptionMonthlyKwh, 1)
          : 0;
      const averageBill = Math.round(consumptionMonthlyKwh * 0.95);
      const monthlySavings = averageBill * 0.9 * coverage;
      const paybackYears =
        monthlySavings > 0
          ? Math.round((optPrice / (monthlySavings * 12)) * 10) / 10
          : 3.5;

      const optPayment = calculateOptionPayment(optPrice, paymentConfig);

      return {
        id: `prev-opt-${sc.position}`,
        position: sc.position,
        name: `${sc.name} (Exemplo)`,
        recommended: sc.recommended,
        scenarioType: sc.scenarioType,
        scenarioText: sc.scenarioText,
        isManualPrice: false,
        targetConsumptionKwh: sc.targetConsumptionKwh,
        systemPowerKwp: sc.systemPowerKwp,
        moduleQty: sc.moduleQty,
        moduleDesc: `${sc.moduleQty}x Módulos 550 W (Exemplo)`,
        inverterDesc: `Inversor Solar ${sc.systemPowerKwp.toFixed(1)} kW (Exemplo)`,
        structureDesc: undefined,
        generationMonthlyKwh: sc.generationMonthlyKwh,
        finalPrice: optPrice,
        imageUrl: undefined,
        coverage,
        monthlySavings,
        paybackYears,
        payment: optPayment,
        futureLoads: sc.scenarioType === 'expansion' ? validatedFutureLoads : undefined,
      };
    });

    const recommendedOption =
      templateOptions.find((o) => o.recommended) ||
      templateOptions[1] ||
      templateOptions[0];

    let clientCity = 'Sua cidade';
    let clientState = 'UF';
    if (company?.baseCity) {
      if (company.baseCity.includes(' - ')) {
        const parts = company.baseCity.split(' - ');
        clientCity = parts[0]?.trim() || 'Sua cidade';
        clientState = parts[1]?.trim() || 'UF';
      } else {
        clientCity = company.baseCity.trim();
      }
    }

    let qr: { img: string; label: string; url?: string } | null = null;
    if (settings.qr?.enabled !== false) {
      const frontendUrl = (
        process.env.FRONTEND_URL || 'https://northway-solar-engine.vercel.app'
      ).replace(/\/?$/, '');
      const settingsUrl = `${frontendUrl}/settings`;
      const qrLabel = (
        settings.qr?.label ||
        DEFAULT_LABEL[settings.qr?.type || 'proposal'] ||
        'Configurações'
      ).slice(0, 40);

      try {
        const qrDataUrl = await QR.toDataURL(settingsUrl, {
          margin: 0,
          width: 400,
          errorCorrectionLevel: 'M',
          color: { dark: '#111111', light: '#ffffff' },
        });
        qr = { img: qrDataUrl, label: qrLabel, url: settingsUrl };
      } catch {
        qr = null;
      }
    }

    const averageBill = Math.round(consumptionMonthlyKwh * 0.95);

    const equipmentList = [
      {
        type: 'module',
        brand: 'Fabricante Tier 1 (Exemplo)',
        model: '550 W Monocristalino (Exemplo)',
        power: '550 W',
        quantity: recommendedOption.moduleQty,
      },
      {
        type: 'inverter',
        brand: 'Fabricante Líder (Exemplo)',
        model: `Inversor ${recommendedOption.systemPowerKwp.toFixed(1)} kW (Exemplo)`,
        power: `${recommendedOption.systemPowerKwp.toFixed(1)} kW`,
        quantity: 1,
      },
    ];

    const proposalObj = {
      id: 'previa',
      code: 'PREVIA',
      clientName: 'Cliente Exemplo',
      clientCity,
      clientCep: '00000-000',
      consumptionKwh: consumptionMonthlyKwh,
      systemPowerKwp: recommendedOption.systemPowerKwp,
      moduleQty: recommendedOption.moduleQty,
      generationMonthlyKwh: recommendedOption.generationMonthlyKwh,
      finalPrice: recommendedOption.finalPrice,
      paybackYears: recommendedOption.paybackYears,
      options: templateOptions,
      createdAt: new Date(),
    } as unknown as Proposal;

    const projectObj = {
      clientName: 'Cliente Exemplo',
      clientCity,
      clientState,
      consumptionMonthlyKwh,
      consumptionMonthlyBill: averageBill,
      sizingPowerKwp: recommendedOption.systemPowerKwp,
      sizingModuleQty: recommendedOption.moduleQty,
      sizingGenerationKwh: recommendedOption.generationMonthlyKwh,
      consultantName: 'Consultor Exemplo',
      equipments: equipmentList,
    } as unknown as SolarProject;

    const assembled: ProposalAssembledData = {
      proposal: proposalObj,
      project: projectObj,
      company: company || ({ name: 'Minha Empresa Solar' } as Company),
      proposalSettings: settings,
      consultantName: 'Consultor Exemplo',
      consultantPhone:
        settings.contact?.whatsapp || settings.contact?.phone || undefined,
      isPreview: true,
      qr,
    };

    const result = await this.pdfRenderer.render(assembled);
    return result.content as Buffer;
  }
}
