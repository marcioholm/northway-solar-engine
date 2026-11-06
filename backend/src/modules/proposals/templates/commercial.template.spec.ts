import { commercialTemplate } from './commercial.template';

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

  it('renders SVG kitArt fallback when kitImageUrl is absent', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      settings: { kitImageUrl: undefined },
    });

    // Check SVG fallback elements
    expect(html).toContain('<svg class="kitart" viewBox="0 0 200 120"');
    expect(html).not.toContain('<img src="undefined"');
  });

  it('renders img tag when kitImageUrl is provided', async () => {
    const html = await commercialTemplate({
      ...baseProposal,
      settings: { kitImageUrl: 'https://storage.supabase.com/kit.png' },
    });

    expect(html).toContain('<img src="https://storage.supabase.com/kit.png">');
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
});
