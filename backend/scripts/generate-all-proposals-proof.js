const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const puppeteer = require('puppeteer-core');
const fs = require('fs');

const { getLocalChromePath } = require('../dist/modules/proposals/renderers/proposal-pdf.renderer');
const { commercialTemplate } = require('../dist/modules/proposals/templates/commercial.template');

const ARTIFACT_DIR = '/Users/Marci.Holm/.gemini/antigravity/brain/d5fa53b1-14e5-4e35-8e90-fef0d3f83109';
const OUTPUT_DIR = path.join(__dirname, 'test-output-pdfs');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const baseData = {
  clientName: 'Carlos Silva & Associados',
  clientCity: 'Campinas',
  clientState: 'SP',
  consultantName: 'Mariana Duarte - Consultora Sênior',
  consultantPhone: '(19) 99876-5432',
  createdAt: '06 de nov. de 2026',
  expirationDate: '16 de novembro de 2026',
  publicToken: 'PROP-2026-X89',
  consumptionKwh: 850,
  systemPowerKwp: 6.6,
  moduleQty: 12,
  generationMonthlyKwh: 880,
  finalPrice: 24500,
  paybackYears: 3.8,
  annualSavings: 6447,
  equipment: [
    { type: 'module', brand: 'Canadian Solar', model: 'TOPHiKu6 550W', quantity: 12, power: '550W' },
    { type: 'inverter', brand: 'Growatt', model: 'MIN 6000TL-X', quantity: 1, power: '6kW' },
  ],
  company: {
    name: 'Northway Energia Solar',
    cashDiscount: 7,
    cardTax: 12,
    financeTax: 18,
  },
  payment: {
    cashPrice: 22785,
    cardInstallment: 2286.67,
    cardTotalPrice: 27440,
    financeInstallment: 481.83,
    financeTotalPrice: 28910,
  },
};

const templates = ['classico', 'moderno', 'minimalista'];

async function run() {
  console.log('Iniciando geração de PDFs e Previews...');
  const chromePath = getLocalChromePath();
  console.log('Chrome encontrado em:', chromePath);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });

  for (const t of templates) {
    console.log(`\n--- Testando Estilo: ${t} ---`);

    // 1. COM IMAGENS
    const dataWithImages = {
      ...baseData,
      company: {
        ...baseData.company,
        logoUrl: 'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/logo.png',
      },
      settings: {
        template: t,
        primaryColor: t === 'classico' ? '#1e3a8a' : t === 'moderno' ? '#0f766e' : '#0f172a',
        secondaryColor: t === 'classico' ? '#b45309' : t === 'moderno' ? '#f59e0b' : '#334155',
        coverImageUrl: 'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/capa.jpg',
        aboutText: 'Mais de 10 anos desenvolvendo usinas solares de alta performance no estado de São Paulo.',
        aboutImageUrl: 'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/institucional.jpg',
        stats: [
          { value: '+850', label: 'Usinas Homologadas' },
          { value: '4.5 MWp', label: 'Potência Instalada' },
          { value: '99.4%', label: 'Satisfação dos Clientes' },
          { value: '25 Anos', label: 'Garantia de Módulos' },
        ],
        partnerLogos: [
          'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/banco1.png',
          'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/banco2.png',
        ],
        brandLogos: [
          'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/canadian.png',
          'https://vwyywxckjusuogwkpjjs.supabase.co/storage/v1/object/public/logos/proposals/11111111-1111-4111-8111-111111111111/growatt.png',
        ],
        serviceAreaText: 'Atendemos toda a região metropolitana de Campinas e Vale do Paraíba.',
        includedItems: [
          'Módulos Fotovoltaicos de Alta Eficiência TOPCon',
          'Inversor com Monitoramento Inteligente Wi-Fi',
          'Estrutura em Alumínio Anodizado com Garantia de Vento',
          'Cabos Solares com Proteção Anti-UV e Conectores MC4',
          'Projeto de Engenharia Elétrica com Emissão de ART',
          'Homologação Completa na Concessionária',
          'Instalação Técnica, Fixação e Comissionamento',
        ],
        warrantiesText: '25 anos de eficiência nos módulos (80% no 25º ano), 10 anos no inversor e 1 ano total na instalação elétrica.',
        exclusionsText: 'Não inclusos: reformas ou reforços estruturais em telhados danificados e obras civis de alvenaria pesada.',
        notesText: 'Proposta válida por 10 dias corridos. Sujeita a disponibilidade de estoque do fabricante.',
        acceptanceText: 'Declaro concordar integralmente com o projeto técnico e valores comerciais desta proposta.',
        contact: {
          phone: '(19) 3200-1000',
          whatsapp: '(19) 99876-5432',
          website: 'www.northwayenergia.com.br',
          instagram: '@northway.energia',
          address: 'Av. Norte Sul, 1200 - Campinas, SP',
        },
        sectionsEnabled: {
          cover: true, about: true, stats: true, technical: true,
          equipment: true, financial: true, kit: true, warranties: true,
          partners: true, contact: true,
        },
      },
    };

    const htmlWithImages = commercialTemplate(dataWithImages);
    await page.setContent(htmlWithImages, { waitUntil: 'domcontentloaded' });

    // Gera PDF com imagens
    const pdfWithImagesBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const pdfPathWithImages = path.join(OUTPUT_DIR, `proposta-${t}-com-imagens.pdf`);
    fs.writeFileSync(pdfPathWithImages, pdfWithImagesBuffer);
    console.log(`✓ PDF gerado com sucesso: ${pdfPathWithImages} (${pdfWithImagesBuffer.length} bytes)`);

    // Captura screenshot da primeira página para anexo de relatório
    const previewPngPath = path.join(ARTIFACT_DIR, `preview-${t}.png`);
    await page.screenshot({
      path: previewPngPath,
      clip: { x: 0, y: 0, width: 794, height: 1123 },
    });
    console.log(`✓ Preview PNG salvo em: ${previewPngPath}`);

    // 2. SEM IMAGENS
    const dataWithoutImages = {
      ...baseData,
      company: {
        name: 'Northway Solar',
        cashDiscount: 5,
        cardTax: 15,
        financeTax: 20,
      },
      settings: {
        template: t,
        primaryColor: t === 'classico' ? '#1e3a8a' : t === 'moderno' ? '#0f766e' : '#0f172a',
        secondaryColor: t === 'classico' ? '#b45309' : t === 'moderno' ? '#f59e0b' : '#334155',
        coverImageUrl: '',
        aboutText: 'Soluções em energia solar fotovoltaica para residências e empresas.',
        aboutImageUrl: '',
        stats: [
          { value: '+500', label: 'Projetos Realizados' },
          { value: '99%', label: 'Clientes Satisfeitos' },
        ],
        partnerLogos: [],
        brandLogos: [],
        serviceAreaText: 'Atendimento em todo o estado de SP.',
        includedItems: [
          'Módulos Solares Fotovoltaicos',
          'Inversor com Wi-Fi',
          'Estrutura de Fixação',
          'Projeto e Homologação',
          'Instalação Completa',
        ],
        warrantiesText: '25 anos nos módulos e 10 anos no inversor.',
        exclusionsText: 'Adequações de padrão de entrada não inclusas.',
        notesText: 'Proposta válida por 10 dias corridos.',
        acceptanceText: 'Declaro concordar com os termos desta proposta.',
        contact: {
          phone: '(11) 3000-0000',
          whatsapp: '(11) 99999-9999',
          website: 'www.northway.com.br',
        },
        sectionsEnabled: {
          cover: true, about: true, stats: true, technical: true,
          equipment: true, financial: true, kit: true, warranties: true,
          partners: true, contact: true,
        },
      },
    };

    const htmlWithoutImages = commercialTemplate(dataWithoutImages);
    await page.setContent(htmlWithoutImages, { waitUntil: 'domcontentloaded' });

    const pdfWithoutImagesBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
    });
    const pdfPathWithoutImages = path.join(OUTPUT_DIR, `proposta-${t}-sem-imagens.pdf`);
    fs.writeFileSync(pdfPathWithoutImages, pdfWithoutImagesBuffer);
    console.log(`✓ PDF gerado com sucesso (sem imagens): ${pdfPathWithoutImages} (${pdfWithoutImagesBuffer.length} bytes)`);
  }

  await browser.close();
  console.log('\nTodos os 6 PDFs e os 3 previews gerados com êxito!');
}

run().catch((err) => {
  console.error('Erro na execução:', err);
  process.exit(1);
});
