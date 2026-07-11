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

export function generateTexts(data: ProposalData) {
  const f = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fi = (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return {
    cover: `${data.clientName}, este é seu Plano Solar Personalizado.`,
    problem: `Atualmente você paga ${f(data.monthlyBill)} por mês para a concessionária ${data.utility}. Em 10 anos, isso representa ${f(data.monthlyBill * 12 * 10)} que poderiam estar no seu bolso.`,
    opportunity: `Com um sistema de ${data.systemPowerKwp.toFixed(2)} kWp, sua conta cairia para aproximadamente ${f(data.monthlyBill - data.monthlySavings)}, gerando uma economia de ${f(data.yearlySavings)} por ano.`,
    whyThisSystem: `${data.clientName}, analisamos seu consumo de ${data.monthlyConsumption} kWh/mês e identificamos que o sistema ideal utiliza ${data.moduleQty} módulos ${data.module.brand} ${data.module.model} com um inversor ${data.inverter.brand} ${data.inverter.model}.`,
    environmental: `Com seu sistema, você evitará a emissão de ${fi(data.co2Avoided)} toneladas de CO₂ — equivalente a preservar ${fi(data.treesPreserved)} árvores ou retirar ${data.carsEquivalent} carros de circulação.`,
    urgency: `Esta proposta é válida até ${new Date(data.expirationDate).toLocaleDateString('pt-BR')}. Os preços de equipamentos e condições podem sofrer alterações após esta data.`,
    finalMessage: `${data.clientName}, obrigado pela confiança. Estamos prontos para transformar sua conta de luz em patrimônio.`,
  };
}

export const DEFAULT_TIMELINE = [
  { label: 'Assinatura', duration: 'Hoje', description: 'Aceite digital da proposta' },
  { label: 'Projeto', duration: '2 dias úteis', description: 'Elaboração do projeto executivo' },
  { label: 'Aprovação', duration: '1 dia útil', description: 'Aprovação do cliente e da concessionária' },
  { label: 'Instalação', duration: '3 dias úteis', description: 'Montagem dos equipamentos e comissionamento' },
  { label: 'Homologação', duration: '15 dias úteis', description: 'Vistoria e liberação pela concessionária' },
  { label: 'Economia', duration: 'A partir de 21 dias', description: 'Créditos na conta de luz' },
];

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

export const DEFAULT_FAQ = [
  { question: 'Preciso ter um telhado grande?', answer: 'Não. Um sistema de 5,2 kWp ocupa aproximadamente 28m² — equivalente a uma vaga de garagem.' },
  { question: 'Funciona em dias nublados?', answer: 'Sim. Os painéis fotovoltaicos geram energia mesmo com luz difusa. A geração é proporcional à radiação solar disponível.' },
  { question: 'E se eu mudar de casa?', answer: 'O sistema pode ser transferido para o novo imóvel. Também é possível negociá-lo como parte do valor do imóvel.' },
  { question: 'Qual a garantia?', answer: 'Os painéis têm garantia de 25 anos de desempenho, o inversor 10 anos, e a instalação 3 anos contra defeitos.' },
  { question: 'Preciso limpar os painéis?', answer: 'Recomendamos limpeza anual. A chuva já faz a maior parte do trabalho. Em regiões muito secas, uma limpeza a cada 6 meses.' },
  { question: 'Quanto tempo dura o sistema?', answer: 'A vida útil ultrapassa 30 anos. Os painéis ainda geram cerca de 80% da capacidade após 25 anos.' },
];

export const DEFAULT_TESTIMONIALS = [
  { name: 'Carlos Mendes', city: 'São Paulo, SP', savings: 480, text: 'Minha conta caiu de R$ 580 para R$ 58. O investimento se pagou em menos de 4 anos.' },
  { name: 'Ana Beatriz', city: 'Campinas, SP', savings: 320, text: 'Além da economia, saber que estou contribuindo com o meio ambiente não tem preço.' },
  { name: 'Roberto Lima', city: 'Ribeirão Preto, SP', savings: 650, text: 'A instalação foi rápida e profissional. Recomendo de olhos fechados.' },
];
