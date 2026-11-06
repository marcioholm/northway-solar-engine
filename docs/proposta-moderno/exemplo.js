// Dados de EXEMPLO (empresa fictícia) para validar o visual. Na integração, tudo vem do projeto
// (kits/pagamento) e de proposal_settings (empresa). Nada aqui é regra de cálculo.
const A = (f) => `assets/${f}`;
const fs = require('fs');
const UFN = { 35: 'SP', 41: 'PR', 42: 'SC', 43: 'RS', 31: 'MG', 33: 'RJ' };
const MUN = fs.readFileSync(__dirname + '/geo/municipios.csv', 'utf8').trim().split('\n').slice(1).map((l) => l.split(','));
// Na integração: a empresa escolhe a cidade num autocomplete (IBGE) e salvamos {ibge,name,uf,lat,lon}.
const city = (name, uf) => {
  const r = MUN.find((m) => m[1] === name && UFN[m[5]] === uf);
  if (!r) throw new Error('cidade não encontrada: ' + name);
  return { ibge: r[0], name, uf, lat: +r[2], lon: +r[3] };
};

function pmt(pv, rateMonthly, n) {
  return (pv * rateMonthly) / (1 - Math.pow(1 + rateMonthly, -n));
}

function buildOption({ name, modules, modulePowerW, inverter, generation, price, recommended }) {
  const cashDiscount = 0.05;
  const cardTax = 0.14; // acréscimo total sobre o preço
  const financeRate = 0.0169; // a.m.
  return {
    name,
    recommended: !!recommended,
    systemPowerKwp: (modules * modulePowerW) / 1000,
    moduleQty: modules,
    module: `Módulo ${modulePowerW} W monocristalino`,
    inverter,
    structure: 'Telhado cerâmico — alumínio anodizado',
    generationMonthlyKwh: generation,
    finalPrice: price,
    payment: {
      cashPrice: price * (1 - cashDiscount),
      cashDiscountPct: cashDiscount * 100,
      cardInstallments: 21,
      cardInstallment: (price * (1 + cardTax)) / 21,
      financeOptions: [60, 72, 120].map((n) => ({ n, installment: pmt(price, financeRate, n) })),
      ownPlan: { downPct: 75, downValue: price * 0.75, n: 3, installment: (price * 0.25) / 3 },
    },
  };
}

const consumptionKwh = 850;
const averageBill = 830;

const options = [
  buildOption({ name: 'Kit 1', modules: 10, modulePowerW: 585, inverter: 'Inversor 5 kW', generation: 670, price: 18490 }),
  buildOption({ name: 'Kit 2', modules: 12, modulePowerW: 585, inverter: 'Inversor 6 kW', generation: 805, price: 21390, recommended: true }),
  buildOption({ name: 'Kit 3', modules: 14, modulePowerW: 585, inverter: 'Inversor 8 kW', generation: 940, price: 24890 }),
].map((o) => {
  const coverage = Math.min(o.generationMonthlyKwh / consumptionKwh, 1);
  const monthlySavings = averageBill * 0.9 * coverage;
  return { ...o, coverage, monthlySavings, paybackYears: o.finalPrice / (monthlySavings * 12) };
});

module.exports = {
  code: 'PRP-2026-0007',
  publicToken: 'a8f3c2e1-demo',
  createdAt: '06/11/2026',
  expirationDate: '21/11/2026',
  client: { name: 'Mercado Bom Preço', city: 'Sorocaba', state: 'SP' },
  consultant: { name: 'Camila Duarte', phone: '(11) 98888-1234' },
  consumptionKwh,
  averageBill,
  options,
  company: { name: 'Horizonte Energia Solar', logoUrl: A('demo-logo.png') },
  settings: {
    template: 'moderno',
    primaryColor: process.env.PRI || '#F28C28',
    secondaryColor: process.env.SEC || '#0B2545',
    coverImageUrl: null, // 2480×2100 px (6:5). Sem foto: capa na cor principal com textura.
    aboutText: 'Somos uma integradora especializada em sistemas fotovoltaicos para comércios e residências, com projeto, homologação e instalação feitos por equipe própria.',
    serviceArea: {
      style: process.env.AREA_STYLE || 'zoom', // 'brasil' | 'zoom' | 'estados'
      states: ['SP', 'PR'],
      cities: [city('Sorocaba', 'SP'), city('Campinas', 'SP'), city('Itu', 'SP'), city('Londrina', 'PR')],
    },
    highlights: [
      { icon: 'team', title: 'Equipe própria', text: 'Projeto, homologação e instalação feitos pelo nosso time, sem terceirização.' },
      { icon: 'support', title: 'Atendimento próximo', text: 'Um consultor acompanha você do orçamento ao pós-venda.' },
      { icon: 'gauge', title: 'Monitoramento', text: 'Acompanhamos a geração do sistema e avisamos se algo sair do esperado.' },
      { icon: 'helmet', title: 'Engenharia', text: 'Projetos assinados por engenheiro eletricista com ART.' },
    ],
    stats: [ { value: '+120', label: 'projetos entregues' }, { value: '8 anos', label: 'de mercado' }, { value: '+1,4 MWp', label: 'instalados' } ],
    partnerLogos: [],
    brandLogos: [],
    kitImageUrl: null,
    includedItems: ['Cabos e conexões CC/CA', 'Projeto elétrico e homologação', 'Mão de obra de instalação', 'Assistência técnica'],
    warrantiesText: 'Até 12 anos contra defeito dos módulos\nAté 25 anos de geração dos módulos com perda máxima de 20%\nAté 10 anos contra defeito do inversor\n12 meses de garantia da instalação',
    servicesText: 'Projeto elétrico e homologação na concessionária\nMonitoramento remoto no primeiro ano',
    exclusionsText: 'Reforços estruturais no telhado, se necessários\nAdequações no padrão de entrada exigidas pela concessionária\nRede de internet para comunicação do inversor',
    notesText: 'Valores de geração e economia são estimativas e podem variar conforme clima, sombreamento e hábitos de consumo.',
    acceptanceText: 'Estou de acordo com a proposta apresentada e autorizo o início do projeto.',
    qr: { enabled: true, type: process.env.QR_TYPE || 'consultant', value: process.env.QR_VALUE || '', message: 'Olá! Recebi a proposta para {cliente} e quero tirar uma dúvida.', label: process.env.QR_LABEL || '' },
    contact: { address: 'Av. Exemplo, 1000 — Sorocaba/SP', phone: '(11) 98888-1234', whatsapp: '5511988881234', instagram: '@horizonte.solar', website: 'www.horizontesolar.com.br' },
  },
};
