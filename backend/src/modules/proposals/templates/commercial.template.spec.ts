import { commercialTemplate } from './commercial.template';
import { KIT_3D_PNG_BASE64 } from './kit-art.data';

describe('commercialTemplate', () => {
  const baseProposal = {
    code: 'PROP-2026-001',
    createdAt: '06/11/2026',
    expirationDate: '16/11/2026',
    client: { name: 'Empresa Cliente', city: 'Campinas', state: 'SP' },
    consultant: { name: 'João Consultor', phone: '11999999999' },
    company: {
      name: 'Northway Energia Solar',
      address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      phone: '(11) 3000-0000',
      website: 'www.northway.com.br',
    },
    systemPowerKwp: 5.4,
    consumptionKwh: 650,
    averageBill: 720,
    settings: {},
    options: [
      {
        id: 'opt-1',
        name: 'Opção Standard',
        recommended: true,
        module: 'Canadian 550W',
        moduleQty: 10,
        inverter: 'Growatt 5kW',
        structure: 'Telhado Cerâmico',
        systemPowerKwp: 5.5,
        generationMonthlyKwh: 680,
        coverage: 1.05,
        monthlySavings: 650,
        paybackYears: 3.2,
        totalInvestment: 22000,
        payment: {
          cashDiscountPct: 5,
          cardInstallments: 12,
          cardTotal: 23500,
          financeOptions: [{ installments: 60, installmentValue: 540 }],
        },
      },
    ],
  };

  it('palette hex colors appear ONLY within the :root block', async () => {
    const palette1 = {
      primaryColor: '#1A365D',
      secondaryColor: '#E28743',
    };
    const palette2 = {
      primaryColor: '#0F766E',
      secondaryColor: '#EC4899',
    };

    const html1 = await commercialTemplate({
      ...baseProposal,
      settings: { ...palette1 },
    });
    const html2 = await commercialTemplate({
      ...baseProposal,
      settings: { ...palette2 },
    });

    const verifyPaletteInRootOnly = (html: string, pri: string, sec: string) => {
      // Find :root { ... }
      const rootMatch = html.match(/:root\s*\{([^}]+)\}/);
      expect(rootMatch).toBeTruthy();
      const rootBlock = rootMatch![1];

      // Remove the :root block from html
      const htmlWithoutRoot = html.replace(rootMatch![0], '');

      // The configured colors should appear in root
      const priLower = pri.toLowerCase();
      const secLower = sec.toLowerCase();
      const rootLower = rootBlock.toLowerCase();
      expect(rootLower).toContain(priLower);
      expect(rootLower).toContain(secLower);

      // The configured colors must NOT appear anywhere else in the document
      const outsideRootLower = htmlWithoutRoot.toLowerCase();
      expect(outsideRootLower).not.toContain(priLower);
      expect(outsideRootLower).not.toContain(secLower);
    };

    verifyPaletteInRootOnly(html1, palette1.primaryColor, palette1.secondaryColor);
    verifyPaletteInRootOnly(html2, palette2.primaryColor, palette2.secondaryColor);
  });

  it('sem o.imageUrl e sem s.kitImageUrl → HTML contém class="kit3d" e "Imagem ilustrativa", e o base64 aparece exatamente 1 vez mesmo com 3 opções', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      settings: { kitImageUrl: undefined },
      options: [
        { ...baseProposal.options[0], id: 'opt-1', imageUrl: undefined },
        { ...baseProposal.options[0], id: 'opt-2', name: 'Opção 2', recommended: false, imageUrl: undefined },
        { ...baseProposal.options[0], id: 'opt-3', name: 'Opção 3', recommended: false, imageUrl: undefined },
      ],
    });

    expect(html).toContain('class="kit3d"');
    expect(html).toContain('Imagem ilustrativa');
    const matches = html.split(KIT_3D_PNG_BASE64).length - 1;
    expect(matches).toBe(1);
  });

  it('com s.kitImageUrl → <img src> com essa URL, sem kit3d e sem a legenda', async () => {
    const kitUrl = 'https://storage.supabase.com/kit.png';
    const html = await commercialTemplate({
      ...baseProposal,
      settings: { kitImageUrl: kitUrl },
      options: [
        { ...baseProposal.options[0], id: 'opt-1', imageUrl: undefined },
      ],
    });

    expect(html).toContain(`<img src="${kitUrl}">`);
    expect(html).not.toContain('class="kit3d"');
    expect(html).not.toContain('Imagem ilustrativa');
    expect(html).not.toContain(KIT_3D_PNG_BASE64);
  });

  it('com o.imageUrl e s.kitImageUrl → vale o o.imageUrl', async () => {
    const optionUrl = 'https://storage.supabase.com/opt-custom.png';
    const settingsUrl = 'https://storage.supabase.com/kit-global.png';
    const html = await commercialTemplate({
      ...baseProposal,
      settings: { kitImageUrl: settingsUrl },
      options: [
        { ...baseProposal.options[0], id: 'opt-1', imageUrl: optionUrl },
      ],
    });

    expect(html).toContain(`<img src="${optionUrl}">`);
    expect(html).not.toContain(`<img src="${settingsUrl}">`);
    expect(html).not.toContain('class="kit3d"');
    expect(html).not.toContain('Imagem ilustrativa');
    expect(html).not.toContain(KIT_3D_PNG_BASE64);
  });

  it('single kit card is wider (has "single" class) and has no "Recomendado" badge', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      options: [baseProposal.options[0]],
    });

    expect(html).toContain('class="cmp single"');
    expect(html).not.toContain('class="opt rec"');
    expect(html).not.toContain('Recomendado</div>');
  });

  it('multiple kit cards show comparison layout and "Recomendado" badge', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      options: [
        baseProposal.options[0],
        {
          ...baseProposal.options[0],
          id: 'opt-2',
          name: 'Opção Premium',
          recommended: false,
          systemPowerKwp: 6.6,
        },
      ],
    });

    expect(html).toContain('class="cmp"');
    expect(html).not.toContain('class="cmp single"');
    expect(html).toContain('class="opt rec"');
    expect(html).toContain('Recomendado</div>');
  });

  it('omits about and partners pages when disabled in sections_enabled', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      settings: {
        sections_enabled: {
          about: false,
          partners: false,
        },
      },
    });

    expect(html).not.toContain('Quem somos');
    expect(html).not.toContain('Marcas que trabalhamos');
  });

  it('uma cor principal clara escolhida de propósito NÃO é trocada (sem heurística)', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      settings: {
        primaryColor: '#FBBF24', // Amarelo claro
        secondaryColor: '#1E3A8A', // Azul escuro
      },
    });

    // --sec deve permanecer com a primaryColor (#FBBF24) e --pri com secondaryColor (#1E3A8A)
    expect(html).toContain('--sec:#FBBF24');
    expect(html).toContain('--pri:#1E3A8A');
  });

  it('investimento com 1 kit: css aplica largura cerca de 2/3 da página e centralização', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      options: [baseProposal.options[0]],
    });

    expect(html).toContain(
      '.cmp.single{grid-template-columns:1fr;width:66.7%;max-width:125mm;margin:4mm auto 0}',
    );
    expect(html).toContain('class="cmp single"');
  });

  it('consultor sem telefone + empresa com WhatsApp: QR code é gerado e exibido na capa', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      publicToken: 'tok-cons-test',
      consultant: { name: 'Carlos Consultor', phone: undefined },
      settings: {
        qr: { enabled: true, type: 'consultant' },
        contact: { whatsapp: '11988887777' },
      },
    });

    expect(html).toContain('class="qrb"');
    expect(html).toContain('Fale com seu consultor');
  });

  describe('paginação automática e rodapé', () => {
    const settings = {
      warrantiesText: 'Garantia A\nGarantia B',
      exclusionsText: 'Exclusão A',
      contact: { phone: '(43) 99999-0000', website: 'www.exemplo.com.br' },
    };

    it('gera capa fixa + fluxo de blocos paginado por script, sem páginas fixas por seção', async () => {
      const html = await commercialTemplate({ ...baseProposal, settings } as any);
      expect((html.match(/<section class="page"/g) || []).length).toBe(1); // só a capa
      expect(html).toContain('<div id="flow">');
      expect(html).toContain('window.__paged=true');
      expect(html).toContain('<template id="tpl-ftr">');
      expect((html.match(/class="blk/g) || []).length).toBeGreaterThan(5);
    });

    it('rodapé traz contatos e numeração "Página X de Y"', async () => {
      const html = await commercialTemplate({ ...baseProposal, settings } as any);
      const ftr = html.slice(html.indexOf('<template id="tpl-ftr">'), html.indexOf('</template>', html.indexOf('<template id="tpl-ftr">')));
      expect(ftr).toContain('(43) 99999-0000');
      expect(ftr).toContain('www.exemplo.com.br');
      expect(ftr).toContain('class="pn"');
      expect(ftr).toContain('class="pt"');
    });

    it('ordem: garantias e condições antes do investimento; aceite por último', async () => {
      const html = await commercialTemplate({ ...baseProposal, settings } as any);
      const flow = html.slice(html.indexOf('<div id="flow">'));
      const iG = flow.indexOf('Garantias e serviços');
      const iC = flow.indexOf('Não faz parte desta proposta');
      const iI = flow.indexOf('Investimento');
      const iA = flow.indexOf('Aceite da proposta');
      expect(iG).toBeGreaterThan(-1);
      expect(iG).toBeLessThan(iC);
      expect(iC).toBeLessThan(iI);
      expect(iI).toBeLessThan(iA);
    });

    it('cada item de lista é um bloco próprio (listas longas quebram entre páginas)', async () => {
      const html = await commercialTemplate({ ...baseProposal, settings } as any);
      expect((html.match(/class="blk it"/g) || []).length).toBe(3);
    });
  });
});
