export type ClientProfile = 'residential' | 'commercial' | 'rural' | 'industrial' | 'public' | 'cooperative';

export interface Equipment {
  type: 'module' | 'inverter' | 'structure' | 'stringBox';
  brand: string;
  model: string;
  quantity: number;
  power?: string;
  warranty?: string;
  benefits?: string[];
}

export interface PaymentMethodConfig {
  pix?: { discountPercent?: number; total?: number };
  creditCard?: { installments?: number; monthly?: number; total?: number };
  financing?: { maxInstallments?: number; monthly?: number; entry?: number };
  consortium?: { estimatedMonths?: number; monthly?: number };
}

export interface TimelineStep {
  label: string;
  duration?: string;
  description?: string;
}

export interface Testimonial {
  name: string;
  city?: string;
  text: string;
  savings?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ProposalData {
  id: string;
  clientName?: string;
  clientCity?: string;
  clientState?: string;
  clientDocument?: string;
  clientPhone?: string;
  clientEmail?: string;
  address?: string;
  coordinator?: string;
  consultantName?: string;
  consultantPhone?: string;
  createdAt?: string;
  expirationDate?: string;
  profile?: ClientProfile;
  utility?: string;
  tariff?: number;
  consumption?: number;
  monthlyBill?: number;
  monthlySavings?: number;
  yearlySavings?: number;
  savings25Years?: number;
  paybackYears?: number;
  roi?: number;
  systemPowerKwp?: number;
  moduleQty?: number;
  module?: { brand: string; model: string; powerWatt: number };
  inverter?: { brand: string; model: string; powerKw: number };
  equipment?: Equipment[];
  finalPrice?: number;
  discountPix?: number;
  installmentPrice?: number;
  installmentMonths?: number;
  treesPreserved?: number;
  co2Avoided?: number;
  cleanEnergyKwh?: number;
  carsEquivalent?: number;
  company?: {
    name?: string;
    clients?: number;
    yearsInMarket?: number;
    satisfactionRate?: number;
    totalProjects?: number;
    engineers?: number;
    googleRating?: number;
    totalWarranty?: number;
  };
  paymentMethods?: PaymentMethodConfig;
  timeline?: TimelineStep[];
  testimonials?: Testimonial[];
  faq?: FAQItem[];
  optionalPlans?: {
    essential?: { finalPrice?: number; monthlySavings?: number; paybackYears?: number; moduleQty?: number };
    recommended?: { finalPrice?: number; monthlySavings?: number; paybackYears?: number; moduleQty?: number };
    premium?: { finalPrice?: number; monthlySavings?: number; paybackYears?: number; moduleQty?: number };
  };
}

// ===== HELPERS =====
export function hasSavingsData(d: ProposalData) {
  return d.monthlyBill != null && d.monthlySavings != null && d.yearlySavings != null;
}

export function hasSystemData(d: ProposalData) {
  return d.systemPowerKwp != null && d.moduleQty != null && d.module && d.inverter;
}

export function hasCalculationData(d: ProposalData) {
  return d.tariff != null && d.consumption != null;
}

export function hasFinancialData(d: ProposalData) {
  return d.finalPrice != null && d.paybackYears != null && d.roi != null;
}

export function hasEnvironmentalData(d: ProposalData) {
  return d.treesPreserved != null || d.co2Avoided != null;
}

export function hasCompanyData(d: ProposalData) {
  return d.company && d.company.name != null;
}

// ===== TEXTO GERADO APENAS COM DADOS REAIS =====
export function generateTexts(data: ProposalData) {
  const name = data.clientName || 'cliente';
  const greeting = data.clientName ? `${data.clientName},` : 'Prezado cliente,';
  const profileLabel = data.profile === 'residential' ? 'residência'
    : data.profile === 'commercial' ? 'estabelecimento comercial'
    : data.profile === 'rural' ? 'propriedade rural'
    : data.profile === 'industrial' ? 'unidade industrial'
    : 'imóvel';

  const sentences: string[] = [];

  // Problem
  if (data.monthlyBill != null && data.utility) {
    sentences.push(`Atualmente ${hasProfile('residential') ? 'sua família' : 'você'} paga ${f(data.monthlyBill)} por mês para a concessionária ${data.utility}.`);
  }

  // Consumption
  if (data.consumption != null) {
    sentences.push(`O consumo médio do ${profileLabel} é de ${data.consumption} kWh/mês.`);
  }

  // Opportunity
  if (data.systemPowerKwp != null && data.monthlySavings != null) {
    const after = data.monthlyBill != null ? data.monthlyBill - data.monthlySavings : null;
    const savingText = after != null ? `reduzindo sua conta para aproximadamente ${f(Math.max(0, after))}` : `gerando uma economia de ${f(data.monthlySavings)}`;
    sentences.push(`Com um sistema de ${data.systemPowerKwp.toFixed(2)} kWp, é possível ${savingText} por mês.`);
  }

  // System description
  if (data.moduleQty && data.module?.brand && data.module?.model && data.inverter?.brand && data.inverter?.model) {
    sentences.push(`O projeto utiliza ${data.moduleQty} módulos ${data.module.brand} ${data.module.model} com inversor ${data.inverter.brand} ${data.inverter.model}.`);
  }

  // Environmental
  if (data.co2Avoided != null && data.treesPreserved != null) {
    sentences.push(`Este sistema evita a emissão de ${fi(data.co2Avoided)} toneladas de CO₂ — equivalente a preservar ${fi(data.treesPreserved)} árvores.`);
  }

  // Urgency
  if (data.expirationDate) {
    sentences.push(`Esta proposta é válida até ${new Date(data.expirationDate).toLocaleDateString('pt-BR')}.`);
  }

  // Final message
  const finalMessage = data.clientName
    ? `${data.clientName}, obrigado pela confiança. Estamos prontos para atender você.`
    : 'Obrigado pela confiança. Estamos prontos para atender você.';

  return {
    greeting,
    tagline: data.profile ? profileTagline(data.profile) : '',
    heroText: sentences.join(' '),
    finalMessage,
    urgency: data.expirationDate ? `Proposta válida até ${new Date(data.expirationDate).toLocaleDateString('pt-BR')}.` : '',
  };

  function hasProfile(p: ClientProfile) { return data.profile === p; }
}

function profileTagline(p: ClientProfile) {
  const m: Record<ClientProfile, string> = {
    residential: 'Economia familiar • Conforto • Valorização do imóvel',
    commercial: 'Redução de custos • Fluxo de caixa • Competitividade',
    rural: 'Irrigação • Bombeamento • Previsibilidade',
    industrial: 'Disponibilidade energética • Escalabilidade • Produtividade',
    public: 'Eficiência • Sustentabilidade • Economia de recursos públicos',
    cooperative: 'Geração compartilhada • Economia associativa',
  };
  return m[p] || '';
}

export function generateWhyPoints(data: ProposalData) {
  const points: { icon: string; title: string; desc: string }[] = [];

  if (data.systemPowerKwp && data.consumption) {
    const icon = data.profile === 'residential' ? '⌂' : data.profile === 'rural' ? '◉' : '▤';
    const title = data.profile === 'residential' ? 'Potência ideal para sua casa'
      : data.profile === 'rural' ? 'Energia para o campo'
      : data.profile === 'industrial' ? 'Disponibilidade energética'
      : 'Sistema dimensionado';
    points.push({ icon, title, desc: `Sistema de ${data.systemPowerKwp.toFixed(2)} kWp projetado para consumo de ${data.consumption} kWh/mês.` });
  }

  if (data.paybackYears) {
    points.push({ icon: '◉', title: 'Retorno do investimento', desc: `Payback estimado em ${data.paybackYears.toFixed(1)} anos.` });
  }

  if (data.module?.brand && data.module?.model) {
    points.push({ icon: '★', title: 'Tecnologia', desc: `Módulos ${data.module.brand} ${data.module.model} — equipamento de linha premium.` });
  }

  if (data.profile === 'residential') {
    points.push({ icon: '☀', title: 'Proteção tarifária', desc: 'A energia solar protege sua família contra os constantes aumentos na tarifa de energia.' });
  }
  if (data.profile === 'commercial' && data.roi) {
    points.push({ icon: '◈', title: 'Vantagem competitiva', desc: `ROI de ${data.roi}% — energia solar como investimento de alto retorno para seu negócio.` });
  }
  if (data.profile === 'rural') {
    points.push({ icon: '⬡', title: 'Previsibilidade no campo', desc: 'Produção rural exige planejamento. Energia solar elimina a variação tarifária.' });
  }
  if (data.profile === 'industrial') {
    points.push({ icon: '◉', title: 'Escalabilidade', desc: 'Sistema projetado para expansão modular — conforme sua produção cresce, sua geração acompanha.' });
  }

  return points;
}

// ===== UTILITIES =====
const f = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fi = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export function formatCurrency(v?: number) {
  if (v == null) return null;
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
