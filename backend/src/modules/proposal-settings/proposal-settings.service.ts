import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProposalSettings } from './entities/proposal-settings.entity';
import { UpdateProposalSettingsDto } from './dto/update-proposal-settings.dto';

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

  constructor(
    @InjectRepository(ProposalSettings)
    private readonly repo: Repository<ProposalSettings>,
  ) {}

  async findByCompanyId(companyId: string): Promise<ProposalSettings> {
    let settings = await this.repo.findOne({ where: { companyId } });
    if (!settings) {
      settings = this.repo.create({
        companyId,
        template: 'moderno',
        primaryColor: '#FFB703',
        secondaryColor: '#0F172A',
        aboutText: DEFAULT_ABOUT_TEXT,
        stats: DEFAULT_STATS,
        partnerLogos: [],
        brandLogos: [],
        serviceAreaText:
          'Atendimento especializado em todo o estado com suporte técnico de excelência e equipe própria.',
        includedItems: DEFAULT_INCLUDED_ITEMS,
        warrantiesText: DEFAULT_WARRANTIES_TEXT,
        exclusionsText: DEFAULT_EXCLUSIONS_TEXT,
        notesText: DEFAULT_NOTES_TEXT,
        acceptanceText: DEFAULT_ACCEPTANCE_TEXT,
        contact: {
          address: '',
          phone: '',
          website: '',
          instagram: '',
          whatsapp: '',
        },
        sectionsEnabled: DEFAULT_SECTIONS_ENABLED,
      });
      settings = await this.repo.save(settings);
    }
    return settings;
  }

  async update(
    companyId: string,
    dto: UpdateProposalSettingsDto,
  ): Promise<ProposalSettings> {
    const settings = await this.findByCompanyId(companyId);

    // Apply fields from DTO
    if (dto.template !== undefined) settings.template = dto.template;
    if (dto.primaryColor !== undefined) settings.primaryColor = dto.primaryColor;
    if (dto.secondaryColor !== undefined)
      settings.secondaryColor = dto.secondaryColor;
    if (dto.coverImageUrl !== undefined)
      settings.coverImageUrl = dto.coverImageUrl;
    if (dto.aboutText !== undefined) settings.aboutText = dto.aboutText;
    if (dto.aboutImageUrl !== undefined)
      settings.aboutImageUrl = dto.aboutImageUrl;
    if (dto.stats !== undefined) settings.stats = dto.stats;
    if (dto.partnerLogos !== undefined) settings.partnerLogos = dto.partnerLogos;
    if (dto.brandLogos !== undefined) settings.brandLogos = dto.brandLogos;
    if (dto.serviceAreaText !== undefined)
      settings.serviceAreaText = dto.serviceAreaText;
    if (dto.includedItems !== undefined)
      settings.includedItems = dto.includedItems;
    if (dto.warrantiesText !== undefined)
      settings.warrantiesText = dto.warrantiesText;
    if (dto.exclusionsText !== undefined)
      settings.exclusionsText = dto.exclusionsText;
    if (dto.notesText !== undefined) settings.notesText = dto.notesText;
    if (dto.acceptanceText !== undefined)
      settings.acceptanceText = dto.acceptanceText;
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

    return this.repo.save(settings);
  }
}
