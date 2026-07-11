export type ClientProfile = 'residential' | 'commercial' | 'rural' | 'industrial';

export interface Equipment {
  type: 'module' | 'inverter' | 'structure' | 'stringBox';
  photo?: string;
  brand: string;
  model: string;
  quantity: number;
  power?: string;
  warranty: string;
  benefits: string[];
}

export interface ProposalData {
  id: string;
  clientName: string;
  clientCity: string;
  clientState: string;
  clientPhoto?: string;
  consultantName: string;
  consultantPhone: string;
  consultantPhoto?: string;
  createdAt: string;
  expirationDate: string;
  profile: ClientProfile;

  monthlyBill: number;
  monthlyConsumption: number;
  utility: string;

  monthlySavings: number;
  yearlySavings: number;
  savings25Years: number;
  paybackYears: number;
  roi: number;

  systemPowerKwp: number;
  moduleQty: number;
  module: { brand: string; model: string; powerWatt: number };
  inverter: { brand: string; model: string; powerKw: number };
  equipment: Equipment[];

  finalPrice: number;
  discountPix: number;
  installmentPrice: number;
  installmentMonths: number;

  treesPreserved: number;
  co2Avoided: number;
  cleanEnergyKwh: number;
  carsEquivalent: number;

  company: {
    name: string;
    clients: number;
    yearsInMarket: number;
    satisfactionRate: number;
    totalProjects: number;
    engineers: number;
    googleRating: number;
    totalWarranty: number;
  };

  paymentMethods: {
    pix: { discountPercent: number; total: number };
    creditCard: { installments: number; monthly: number; total: number };
    financing: { maxInstallments: number; monthly: number; entry: number };
    consortium: { estimatedMonths: number; monthly: number };
  };

  timeline: {
    label: string;
    duration: string;
    description: string;
  }[];

  testimonials: {
    name: string;
    photo?: string;
    city: string;
    savings: number;
    text: string;
  }[];

  faq: {
    question: string;
    answer: string;
  }[];

  optionalPlans?: {
    essential: { finalPrice: number; monthlySavings: number; paybackYears: number; moduleQty: number };
    recommended: { finalPrice: number; monthlySavings: number; paybackYears: number; moduleQty: number };
    premium: { finalPrice: number; monthlySavings: number; paybackYears: number; moduleQty: number };
  };
}

const f = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fi = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pp = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ===== PERFIL RESIDENCIAL =====
const residential = {
  coverTagline: 'Economia familiar • Conforto • Valorização do imóvel',
  problem: (d: ProposalData) => `Atualmente sua família paga ${f(d.monthlyBill)} por mês para a concessionária ${d.utility}. Em 10 anos, são ${f(d.monthlyBill * 12 * 10)} que poderiam ser investidos no conforto da sua casa.`,
  opportunity: (d: ProposalData) => `Com ${d.moduleQty} painéis solares de alta eficiência, sua conta de luz cai para aproximadamente ${f(d.monthlyBill - d.monthlySavings)} por mês — uma economia que protege sua família contra os constantes aumentos na tarifa de energia.`,
  whyThisSystem: (d: ProposalData) => `${d.clientName}, analisamos o consumo da sua residência de ${d.monthlyConsumption} kWh/mês. O sistema de ${d.systemPowerKwp.toFixed(2)} kWp com ${d.moduleQty} módulos ${d.module.brand} ${d.module.model} foi dimensionado para atender sua necessidade atual com margem para crescimento — como a chegada de novos eletrodomésticos ou um veículo elétrico.`,
  whyPoints: (d: ProposalData) => [
    { icon: '⌂', title: 'Proteção contra inflação energética', desc: `A tarifa de energia sobe em média 8% ao ano. Com o solar, você fixa seu custo por 25 anos.` },
    { icon: '★', title: 'Valorização do imóvel', desc: `Imóveis com energia solar valorizam de 4% a 8% — e vendem até 2x mais rápido.` },
    { icon: '☀', title: 'Conforto e independência', desc: `Gere sua própria energia e fique protegido contra apagões e bandeiras tarifárias.` },
    { icon: '◉', title: 'Retorno rápido', desc: `Em apenas ${d.paybackYears.toFixed(1)} anos o sistema se paga. Depois disso, sua energia é praticamente gratuita.` },
  ],
  equipmentBenefits: {
    module: ['Alta eficiência para máximo aproveitamento do telhado', 'Tecnologia silenciosa — zero ruído', 'Garantia de 25 anos de desempenho'],
    inverter: ['Operação silenciosa (<30dB)', 'Monitoramento pelo celular', 'Proteção contra surtos elétricos'],
    structure: ['Fixação sem perfuração do telhado', 'Resistente a ventos de 150km/h', 'Garantia de 12 anos'],
    stringBox: ['Proteção completa contra descargas', 'Instalação simplificada', 'Segurança para toda a família'],
  },
  environmental: (d: ProposalData) => `Com seu sistema residencial, você evita a emissão de ${fi(d.co2Avoided)} toneladas de CO₂ — equivalente a plantar ${fi(d.treesPreserved)} árvores ou retirar ${d.carsEquivalent} carros de circulação por ano.`,
  finalMessage: (d: ProposalData) => `${d.clientName}, obrigado pela confiança. Estamos prontos para transformar sua conta de luz em mais conforto e economia para sua família.`,
};

// ===== PERFIL COMERCIAL =====
const commercial = {
  coverTagline: 'Redução de custos • Fluxo de caixa • ROI • Competitividade',
  problem: (d: ProposalData) => `Atualmente seu negócio paga ${f(d.monthlyBill)} por mês em energia elétrica para a ${d.utility}. Em 10 anos, são ${f(d.monthlyBill * 12 * 10)} que poderiam estar fortalecendo seu fluxo de caixa.`,
  opportunity: (d: ProposalData) => `Com um sistema de ${d.systemPowerKwp.toFixed(2)} kWp, sua despesa com energia cai para aproximadamente ${f(d.monthlyBill - d.monthlySavings)}/mês — reduzindo custos fixos e aumentando a competitividade do seu negócio.`,
  whyThisSystem: (d: ProposalData) => `${d.clientName}, analisamos o consumo do seu estabelecimento comercial de ${d.monthlyConsumption} kWh/mês. O sistema de ${d.systemPowerKwp.toFixed(2)} kWp com ${d.moduleQty} módulos ${d.module.brand} foi dimensionado para maximizar o retorno sobre o investimento no seu segmento.`,
  whyPoints: (d: ProposalData) => [
    { icon: '▤', title: 'Redução de custos fixos', desc: `Energia solar reduz em até 90% a despesa com eletricidade — um dos maiores custos operacionais do comércio.` },
    { icon: '◉', title: 'ROI acelerado', desc: `Retorno do investimento em ${d.paybackYears.toFixed(1)} anos com TIR superior a aplicações financeiras tradicionais.` },
    { icon: '◈', title: 'Fluxo de caixa previsível', desc: `Elimine a volatilidade das bandeiras tarifárias e planeje seu orçamento com precisão.` },
    { icon: '⬡', title: 'Vantagem competitiva', desc: `Reduza seus custos operacionais e repasse essa economia para seus clientes — ou aumente sua margem.` },
  ],
  equipmentBenefits: {
    module: ['Máxima geração no horário comercial (pico de demanda)', 'Alta durabilidade para operação contínua', 'Garantia de desempenho de 25 anos'],
    inverter: ['Eficiência máxima de 97.6%', 'Monitoramento remoto em tempo real', 'Gestão de energia por aplicativo'],
    structure: ['Estrutura robusta para lajes e telhados comerciais', 'Quick-install — montagem rápida', 'Resistência a ventos de 180km/h'],
    stringBox: ['Proteção industrial contra surtos', 'Disjuntor de alta capacidade', 'Certificação INMETRO'],
  },
  environmental: (d: ProposalData) => `Ao investir em energia solar, seu negócio evita ${fi(d.co2Avoided)} toneladas de CO₂ anualmente — fortalecendo sua marca com responsabilidade ambiental e abrindo portas para clientes que valorizam sustentabilidade.`,
  finalMessage: (d: ProposalData) => `${d.clientName}, obrigado pela confiança. Estamos prontos para transformar sua despesa de energia em vantagem competitiva para seu negócio.`,
};

// ===== PERFIL RURAL =====
const rural = {
  coverTagline: 'Irrigação • Bombeamento • Ordenha • Previsibilidade',
  problem: (d: ProposalData) => `Atualmente sua propriedade rural paga ${f(d.monthlyBill)} por mês em energia para a ${d.utility}. No campo, esse custo impacta diretamente a rentabilidade da sua produção.`,
  opportunity: (d: ProposalData) => `Com um sistema de ${d.systemPowerKwp.toFixed(2)} kWp, sua conta de energia cai para aproximadamente ${f(d.monthlyBill - d.monthlySavings)}/mês — liberando recursos para investir no que realmente importa: sua produção.`,
  whyThisSystem: (d: ProposalData) => `${d.clientName}, analisamos o consumo da sua propriedade rural de ${d.monthlyConsumption} kWh/mês. O sistema de ${d.systemPowerKwp.toFixed(2)} kWp com ${d.moduleQty} módulos ${d.module.brand} foi projetado para suportar as demandas do campo — irrigação, bombeamento, ordenha e armazenagem — com total previsibilidade de custos.`,
  whyPoints: (d: ProposalData) => [
    { icon: '◉', title: 'Energia para irrigação e bombeamento', desc: `Sistema dimensionado para suportar motores elétricos de irrigação, pivôs centrais e bombas d'água sem sustos na conta.` },
    { icon: '⬡', title: 'Previsibilidade de custos', desc: `Produção rural sazonal exige planejamento. Com o solar, você elimina a variação tarifária e sabe exatamente quanto vai gastar.` },
    { icon: '★', title: 'Autonomia no campo', desc: `Independência energética para operações críticas — ordenha, refrigeração de leite, armazenagem de grãos.` },
    { icon: '⌂', title: 'Aproveitamento de áreas', desc: `Utilize áreas não agricultáveis da propriedade (telhados de galpões, currais) para gerar energia limpa.` },
  ],
  equipmentBenefits: {
    module: ['Painéis robustos para ambiente rural (poeira, umidade)', 'Alta eficiência em temperaturas elevadas', 'Garantia de 25 anos de desempenho'],
    inverter: ['Proteção IP65 contra poeira e jatos d\'água', 'Suporte a motores de alta potência de partida', 'Monitoramento remoto via satélite'],
    structure: ['Estrutura galvanizada para ambientes agressivos', 'Fixação em telhados metálicos e de fibrocimento', 'Resistência a ventos de 200km/h'],
    stringBox: ['Proteção reforçada contra surtos atmosféricos', 'Disjuntores de alta capacidade para motores', 'Caixa estanque IP65'],
  },
  environmental: (d: ProposalData) => `Sua propriedade rural já cuida da terra. Com a energia solar, você evita ${fi(d.co2Avoided)} toneladas de CO₂ por ano — provando que produção rural e sustentabilidade caminham juntas.`,
  finalMessage: (d: ProposalData) => `${d.clientName}, obrigado pela confiança. Estamos prontos para levar mais independência energética e previsibilidade de custos para sua produção rural.`,
};

// ===== PERFIL INDUSTRIAL =====
const industrial = {
  coverTagline: 'Disponibilidade energética • Escalabilidade • Produtividade',
  problem: (d: ProposalData) => `Atualmente sua unidade industrial paga ${f(d.monthlyBill)} por mês em energia para a ${d.utility}. Para a indústria, energia não é despesa — é insumo produtivo. E seu custo atual compromete a competitividade.`,
  opportunity: (d: ProposalData) => `Com um sistema de ${d.systemPowerKwp.toFixed(2)} kWp de geração distribuída, seu custo com energia cai para aproximadamente ${f(d.monthlyBill - d.monthlySavings)}/mês — liberando capital para reinvestir em produtividade.`,
  whyThisSystem: (d: ProposalData) => `${d.clientName}, analisamos a demanda energética da sua operação industrial de ${d.monthlyConsumption} kWh/mês. O sistema de ${d.systemPowerKwp.toFixed(2)} kWp utiliza ${d.moduleQty} módulos ${d.module.brand} de alto rendimento, projetado para escalabilidade e máxima disponibilidade.`,
  whyPoints: (d: ProposalData) => [
    { icon: '◈', title: 'Disponibilidade energética', desc: `Gere sua própria energia e reduza o risco de paradas na produção por variações tarifárias ou restrições da rede.` },
    { icon: '◉', title: 'Escalabilidade', desc: `O sistema foi projetado para expansão modular — conforme sua produção cresce, sua geração acompanha.` },
    { icon: '▤', title: 'Redução do custo operacional', desc: `Energia solar reduz o OPEX de forma permanente. Em ${d.paybackYears.toFixed(1)} anos o investimento se paga e o custo energético tende a zero.` },
    { icon: '⬡', title: 'Produtividade e competitividade', desc: `Reduza o custo por unidade produzida e ganhe vantagem competitiva — inclusive para exportação, onde sustentabilidade é diferencial.` },
  ],
  equipmentBenefits: {
    module: ['Módulos de alta potência para máxima geração por m²', 'Tecnologia de ponta com eficiência >21.5%', 'Garantia de desempenho linear de 25 anos'],
    inverter: ['Inversores industriais com proteção IP66', 'Suporte a alta tensão (600V-1000V)', 'Monitoramento SCADA-ready'],
    structure: ['Estrutura industrial pesada para lajes e telhados metalicos', 'Sistema de ancoragem certificado', 'Resistência a ventos de 220km/h'],
    stringBox: ['Quadro de proteção industrial certificado', 'DPS Classe I + II para proteção total', 'Disjuntores termomagnéticos de alta capacidade'],
  },
  environmental: (d: ProposalData) => `Sua indústria evita ${fi(d.co2Avoided)} toneladas de CO₂ anualmente com este sistema — reduzindo sua pegada de carbono e abrindo portas para certificações ambientais e mercados exigentes.`,
  finalMessage: (d: ProposalData) => `${d.clientName}, obrigado pela confiança. Estamos prontos para transformar sua matriz energética em vantagem competitiva industrial.`,
};

// ===== MAPEAMENTO POR PERFIL =====
const profileMap = { residential, commercial, rural, industrial };

export function useProfile(profile: ClientProfile) {
  return profileMap[profile] || profileMap.residential;
}

// ===== GERAÇÃO DE TEXTOS =====
export function generateTexts(data: ProposalData) {
  const p = useProfile(data.profile);

  return {
    cover: `${data.clientName}, este é seu Plano Solar Personalizado.`,
    tagline: p.coverTagline,
    problem: p.problem(data),
    opportunity: p.opportunity(data),
    whyThisSystem: p.whyThisSystem(data),
    whyPoints: p.whyPoints(data),
    environmental: p.environmental(data),
    finalMessage: p.finalMessage(data),
    urgency: `Esta proposta é válida até ${new Date(data.expirationDate).toLocaleDateString('pt-BR')}. Os preços de equipamentos e condições podem sofrer alterações após esta data.`,
  };
}

export function getEquipmentBenefits(profile: ClientProfile, type: string): string[] {
  const p = useProfile(profile);
  return (p.equipmentBenefits as any)[type] || [];
}

const DEFAULT_MONTHLY_CONSUMPTION = 520;
const DEFAULT_MONTHLY_BILL = 480;

export const DEFAULT_TIMELINE_RESIDENTIAL = [
  { label: 'Assinatura', duration: 'Hoje', description: 'Aceite digital da proposta' },
  { label: 'Projeto', duration: '2 dias úteis', description: 'Elaboração do projeto executivo' },
  { label: 'Aprovação', duration: '1 dia útil', description: 'Aprovação do cliente e da concessionária' },
  { label: 'Instalação', duration: '3 dias úteis', description: 'Montagem dos equipamentos e comissionamento' },
  { label: 'Homologação', duration: '15 dias úteis', description: 'Vistoria e liberação pela concessionária' },
  { label: 'Economia', duration: 'A partir de 21 dias', description: 'Créditos na conta de luz' },
];

export const DEFAULT_TIMELINE_COMERCIAL = [
  { label: 'Assinatura', duration: 'Hoje', description: 'Aceite digital da proposta' },
  { label: 'Projeto', duration: '5 dias úteis', description: 'Projeto executivo comercial' },
  { label: 'Aprovação', duration: '2 dias úteis', description: 'Aprovação do cliente' },
  { label: 'Instalação', duration: '7 dias úteis', description: 'Instalação em horário comercial' },
  { label: 'Homologação', duration: '20 dias úteis', description: 'Vistoria e liberação' },
  { label: 'Economia', duration: 'A partir de 34 dias', description: 'Redução imediata no CFUR' },
];

export const DEFAULT_TIMELINE_RURAL = [
  { label: 'Assinatura', duration: 'Hoje', description: 'Aceite digital da proposta' },
  { label: 'Vistoria Técnica', duration: '3 dias úteis', description: 'Visita técnica à propriedade' },
  { label: 'Projeto Rural', duration: '5 dias úteis', description: 'Projeto adaptado ao campo' },
  { label: 'Instalação', duration: '5 dias úteis', description: 'Instalação com mínimo impacto na produção' },
  { label: 'Homologação', duration: '20 dias úteis', description: 'Vistoria e liberação pela concessionária' },
  { label: 'Economia', duration: 'A partir de 33 dias', description: 'Redução no custo de produção' },
];

export const DEFAULT_TIMELINE_INDUSTRIAL = [
  { label: 'Assinatura', duration: 'Hoje', description: 'Aceite digital da proposta' },
  { label: 'Engenharia', duration: '10 dias úteis', description: 'Projeto executivo industrial detalhado' },
  { label: 'Aprovação', duration: '5 dias úteis', description: 'Aprovações técnicas e regulatórias' },
  { label: 'Instalação', duration: '15 dias úteis', description: 'Instalação programada sem parar produção' },
  { label: 'Comissionamento', duration: '3 dias úteis', description: 'Testes e start-up do sistema' },
  { label: 'Homologação', duration: '20 dias úteis', description: 'Vistoria e liberação pela concessionária' },
  { label: 'Economia', duration: 'A partir de 53 dias', description: 'Redução no OPEX energético' },
];

export function getTimeline(profile: ClientProfile) {
  const map: Record<ClientProfile, typeof DEFAULT_TIMELINE_RESIDENTIAL> = {
    residential: DEFAULT_TIMELINE_RESIDENTIAL,
    commercial: DEFAULT_TIMELINE_COMERCIAL,
    rural: DEFAULT_TIMELINE_RURAL,
    industrial: DEFAULT_TIMELINE_INDUSTRIAL,
  };
  return map[profile] || DEFAULT_TIMELINE_RESIDENTIAL;
}

export const DEFAULT_COMPANY = {
  name: 'SolarOS Energia',
  clients: 850,
  yearsInMarket: 6,
  satisfactionRate: 98,
  totalProjects: 1200,
  engineers: 4,
  googleRating: 4.9,
  totalWarranty: 3,
};

export const DEFAULT_FAQ: Record<ClientProfile, { question: string; answer: string }[]> = {
  residential: [
    { question: 'Preciso ter um telhado grande?', answer: 'Não. Um sistema de 5,2 kWp ocupa aproximadamente 28m² — equivalente a uma vaga de garagem.' },
    { question: 'Funciona em dias nublados?', answer: 'Sim. Os painéis fotovoltaicos geram energia mesmo com luz difusa. A geração é proporcional à radiação solar disponível.' },
    { question: 'E se eu mudar de casa?', answer: 'O sistema pode ser transferido para o novo imóvel. Também é possível negociá-lo como parte do valor do imóvel.' },
    { question: 'Vou precisar limpar os painéis?', answer: 'A chuva já faz a maior parte do trabalho. Recomendamos uma limpeza simples uma vez por ano.' },
    { question: 'O sistema valoriza o imóvel?', answer: 'Sim. Imóveis com energia solar valorizam de 4% a 8% e vendem até 2x mais rápido.' },
    { question: 'Qual a garantia?', answer: 'Painéis: 25 anos de desempenho. Inversor: 10 anos. Instalação: 3 anos.' },
  ],
  commercial: [
    { question: 'Qual o ROI para comércio?', answer: `O retorno médio é de ${pp(4.2)} anos, com IRR superior a 20% — melhor que a maioria dos investimentos tradicionais.` },
    { question: 'Funciona em dias nublados?', answer: 'Sim. Os painéis geram energia mesmo com luz difusa. A geração é proporcional à radiação disponível.' },
    { question: 'O sistema ocupa muito espaço?', answer: 'Depende do porte. Um sistema comercial típico ocupa área de telhado equivalente a algumas vagas de estacionamento.' },
    { question: 'Preciso parar o negócio para instalar?', answer: 'Não. A instalação é programada fora do horário comercial ou em áreas isoladas da operação.' },
    { question: 'Como fica a manutenção?', answer: 'Mínima. Recomendamos inspeção anual. O monitoramento remoto avisa qualquer anomalia.' },
    { question: 'Compensa financiar?', answer: 'Sim. Com a economia gerada, a parcela do financiamento pode ser menor que a conta de luz atual.' },
  ],
  rural: [
    { question: 'O sistema aguenta bombas e motores?', answer: 'Sim. Dimensionamos o inversor para suportar a corrente de partida de motores elétricos rurais.' },
    { question: 'Funciona em dias nublados?', answer: 'Sim. Os painéis geram energia mesmo com nebulosidade. Em dias chuvosos, a propriedade continua conectada à rede.' },
    { question: 'Preciso desligar a irrigação?', answer: 'Não. O sistema opera em paralelo com a rede. Quando o sol estiver forte, você usa a energia solar; à noite ou em dias nublados, usa a rede.' },
    { question: 'E durante a colheita/safra?', answer: 'Justamente nessa época o sol é mais forte — seu sistema gera mais quando a demanda da propriedade está no pico.' },
    { question: 'O sistema ocupa área agricultável?', answer: 'Não. Instalamos em telhados de galpões, currais, estábulos ou áreas não cultiváveis da propriedade.' },
    { question: 'Quanto tempo dura?', answer: 'A vida útil ultrapassa 30 anos. Os painéis mantêm 80% da capacidade após 25 anos.' },
  ],
  industrial: [
    { question: 'O sistema atende minha demanda industrial?', answer: 'Sim. Projetamos sistemas modulares e escaláveis que podem suprir de 30% a 100% do consumo industrial.' },
    { question: 'Funciona 24 horas?', answer: 'O sistema gera durante o dia. À noite, a indústria utiliza a rede normalmente. O sistema de compensação de créditos garante o benefício 24h.' },
    { question: 'Como fica durante quedas de energia?', answer: 'Sistemas conectados à rede desligam automaticamente por segurança. Para crítico, recomendamos sistema híbrido com baterias.' },
    { question: 'Qual o impacto no OPEX?', answer: 'A redução no custo de energia pode chegar a 90%, impactando diretamente o custo por unidade produzida.' },
    { question: 'Preciso parar a produção para instalar?', answer: 'Não. A instalação é programada em etapas, sem interferir na operação industrial.' },
    { question: 'Ajuda em certificações ambientais?', answer: 'Sim. Energia solar renovável contribui para ISO 14001, GHG Protocol e relatórios ESG.' },
  ],
};

export const DEFAULT_TESTIMONIALS: Record<ClientProfile, { name: string; city: string; savings: number; text: string }[]> = {
  residential: [
    { name: 'Carlos Mendes', city: 'São Paulo, SP', savings: 480, text: 'Minha conta caiu de R$ 580 para R$ 58. O investimento se pagou em menos de 4 anos.' },
    { name: 'Ana Beatriz', city: 'Campinas, SP', savings: 320, text: 'Além da economia, saber que estou contribuindo com o meio ambiente não tem preço.' },
    { name: 'Roberto Lima', city: 'Ribeirão Preto, SP', savings: 650, text: 'A instalação foi rápida e profissional. Recomendo de olhos fechados.' },
  ],
  commercial: [
    { name: 'Mercado Silva', city: 'São Paulo, SP', savings: 2800, text: 'Nossa conta de energia era um dos maiores custos fixos. A solar reduziu em 85% — impacto direto no resultado.' },
    { name: 'Dra. Patrícia', city: 'Campinas, SP', savings: 1200, text: 'Minha clínica economiza mais de R$ 1.200 por mês. O investimento se pagou em 3 anos e meio.' },
    { name: 'Rede de Farmácias Mais Saúde', city: 'ABC Paulista', savings: 4500, text: 'Instalamos em 3 lojas como piloto. Em 12 meses expandimos para toda a rede. ROI excepcional.' },
  ],
  rural: [
    { name: 'Sitio São João', city: 'Itapetininga, SP', savings: 1800, text: 'A conta de energia do sítio era imprevisível — cada mês um susto. Agora sei exatamente quanto vou gastar.' },
    { name: 'Fazenda Boa Vista', city: 'Uberaba, MG', savings: 3500, text: 'Com a energia solar, reduzimos o custo da irrigação em 70%. O dinheiro que sobra vai para melhorar o rebanho.' },
    { name: 'Cooperativa Agro', city: 'Londrina, PR', savings: 6200, text: 'Nossa cooperativa instalou um sistema compartilhado. Seis produtores rurais dividindo o benefício.' },
  ],
  industrial: [
    { name: 'Metalurgica ABC', city: 'São Bernardo, SP', savings: 15000, text: 'Reduzimos nosso OPEX energético em 60%. O payback veio em 3 anos. Agora planejamos expandir.' },
    { name: 'Alimentos do Vale', city: 'Pouso Alegre, MG', savings: 22000, text: 'Energia solar nos deu previsibilidade de custos num setor de margens apertadas. Diferencial competitivo real.' },
    { name: 'Logitech Brasil', city: 'Jundiaí, SP', savings: 18000, text: 'Além da economia, o sistema contribuiu para nossa certificação LEED e metas globais de sustentabilidade.' },
  ],
};

export function buildMockData(id: string, profile: ClientProfile = 'residential'): ProposalData {
  const monthlyBill = DEFAULT_MONTHLY_BILL;
  const monthlyConsumption = DEFAULT_MONTHLY_CONSUMPTION;
  const monthlySavings = 432;
  const yearlySavings = monthlySavings * 12;
  const finalPrice = 24900;
  const paybackYears = 4.2;
  const roi = 589;
  const systemPowerKwp = 5.2;
  const co2Avoided = 28;
  const treesPreserved = 156;
  const cleanEnergyKwh = 390000;
  const carsEquivalent = 8;

  return {
    id,
    clientName: 'João da Silva',
    clientCity: 'São Paulo',
    clientState: 'SP',
    consultantName: 'Marcos Oliveira',
    consultantPhone: '(11) 99999-8888',
    createdAt: new Date().toISOString(),
    expirationDate: new Date(Date.now() + 15 * 86400000).toISOString(),
    profile,
    monthlyBill,
    monthlyConsumption,
    utility: 'Enel',
    monthlySavings,
    yearlySavings,
    savings25Years: yearlySavings * 25,
    paybackYears,
    roi,
    systemPowerKwp,
    moduleQty: 12,
    module: { brand: 'Canadian Solar', model: 'HiKu6', powerWatt: 550 },
    inverter: { brand: 'Growatt', model: 'MIN 5000TL-X', powerKw: 5 },
    equipment: [
      { type: 'module', brand: 'Canadian Solar', model: 'HiKu6', quantity: 12, power: '550W', warranty: '25 anos', benefits: getEquipmentBenefits(profile, 'module') },
      { type: 'inverter', brand: 'Growatt', model: 'MIN 5000TL-X', quantity: 1, power: '5kW', warranty: '10 anos', benefits: getEquipmentBenefits(profile, 'inverter') },
      { type: 'structure', brand: 'Solarfix', model: 'Pro-Fix 2000', quantity: 1, warranty: '12 anos', benefits: getEquipmentBenefits(profile, 'structure') },
      { type: 'stringBox', brand: 'WEG', model: 'SB-CC-5kW', quantity: 1, warranty: '5 anos', benefits: getEquipmentBenefits(profile, 'stringBox') },
    ],
    finalPrice,
    discountPix: finalPrice * 0.05,
    installmentPrice: finalPrice / 12,
    installmentMonths: 12,
    treesPreserved,
    co2Avoided,
    cleanEnergyKwh,
    carsEquivalent,
    company: DEFAULT_COMPANY,
    paymentMethods: {
      pix: { discountPercent: 5, total: finalPrice * 0.95 },
      creditCard: { installments: 12, monthly: Math.round(finalPrice / 12), total: finalPrice },
      financing: { maxInstallments: 72, monthly: Math.round(finalPrice / 72 * 1.2), entry: 0 },
      consortium: { estimatedMonths: 18, monthly: Math.round(finalPrice / 18 * 1.08) },
    },
    timeline: getTimeline(profile),
    testimonials: DEFAULT_TESTIMONIALS[profile],
    faq: DEFAULT_FAQ[profile],
    optionalPlans: {
      essential: { finalPrice: 21000, monthlySavings: 380, paybackYears: 4.8, moduleQty: 10 },
      recommended: { finalPrice: 24900, monthlySavings: 432, paybackYears: 4.2, moduleQty: 12 },
      premium: { finalPrice: 32500, monthlySavings: 520, paybackYears: 5.1, moduleQty: 16 },
    },
  };
}
