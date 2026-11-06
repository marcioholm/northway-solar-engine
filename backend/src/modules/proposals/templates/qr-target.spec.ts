import { safeUrl, resolveDestination, qrTarget, DEFAULT_LABEL } from './qr-target';

describe('qr-target', () => {
  describe('safeUrl', () => {
    it('allows valid https URLs', () => {
      expect(safeUrl('https://example.com/proposal')).toBe('https://example.com/proposal');
      expect(safeUrl('https://wa.me/5511999999999')).toBe('https://wa.me/5511999999999');
    });

    it('blocks dangerous or insecure URLs', () => {
      expect(safeUrl('http://insecure.com')).toBeNull();
      expect(safeUrl('javascript:alert(1)')).toBeNull();
      expect(safeUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
      expect(safeUrl('vbscript:alert(1)')).toBeNull();
      expect(safeUrl('')).toBeNull();
      expect(safeUrl(undefined as any)).toBeNull();
      expect(safeUrl('not-a-url')).toBeNull();
    });
  });

  describe('resolveDestination', () => {
    const baseProposal = {
      publicToken: 'tok-abc',
      client: { name: 'João Silva' },
    };

    it('returns public proposal link when type is proposal', () => {
      const dest = resolveDestination(
        baseProposal,
        { type: 'proposal' },
        'https://app.solarengine.com/proposta/',
      );
      expect(dest).toBe('https://app.solarengine.com/proposta/tok-abc?src=qr');
    });

    it('resolves whatsapp with phone and custom message replacing {cliente}', () => {
      const dest = resolveDestination(
        baseProposal,
        {
          type: 'whatsapp',
          value: '11 98765-4321',
          message: 'Olá, {cliente}! Como podemos ajudar?',
        },
      );
      expect(dest).toContain('https://wa.me/5511987654321');
      expect(dest).toContain('Ol%C3%A1%2C%20Jo%C3%A3o%20Silva');
    });

    it('resolves custom https URL', () => {
      const dest = resolveDestination(
        baseProposal,
        { type: 'custom', value: 'https://mysite.com/info' },
      );
      expect(dest).toBe('https://mysite.com/info');
    });

    it('blocks custom URL if not https', () => {
      const dest = resolveDestination(
        baseProposal,
        { type: 'custom', value: 'http://mysite.com/info' },
      );
      expect(dest).toBeNull();
    });

    it('uses company whatsapp when consultant phone is missing', () => {
      const dest = resolveDestination(
        {
          publicToken: 'tok-abc',
          client: { name: 'João Silva' },
          consultant: { name: 'Consultor Sem Tel', phone: undefined },
          companyWhatsapp: '11 91111-2222',
        },
        { type: 'consultant' },
      );
      expect(dest).toContain('https://wa.me/5511911112222');
    });

    it('uses consultant phone when present', () => {
      const dest = resolveDestination(
        {
          publicToken: 'tok-abc',
          client: { name: 'João Silva' },
          consultant: { name: 'Consultor Com Tel', phone: '11 99999-8888' },
          companyWhatsapp: '11 91111-2222',
        },
        { type: 'consultant' },
      );
      expect(dest).toContain('https://wa.me/5511999998888');
    });
  });

  describe('qrTarget', () => {
    it('returns null when qr is disabled', () => {
      const res = qrTarget({
        publicToken: 'tok-xyz',
        settings: { qr: { enabled: false, type: 'proposal' } },
      });
      expect(res).toBeNull();
    });

    it('generates target URL and custom label', () => {
      const res = qrTarget(
        {
          publicToken: 'tok-xyz',
          settings: {
            qr: { enabled: true, type: 'proposal', label: 'Escaneie aqui' },
          },
        },
        { trackBase: 'https://app.test/q' },
      );
      expect(res).not.toBeNull();
      expect(res?.label).toBe('Escaneie aqui');
      expect(res?.url).toBe('https://app.test/q/tok-xyz');
    });

    it('falls back to default label when label is empty', () => {
      const res = qrTarget(
        {
          publicToken: 'tok-xyz',
          settings: {
            qr: { enabled: true, type: 'proposal' },
          },
        },
        { trackBase: 'https://app.test/q' },
      );
      expect(res?.label).toBe(DEFAULT_LABEL.proposal);
    });

    it('uses API_PUBLIC_URL environment variable when present', () => {
      const oldEnv = process.env.API_PUBLIC_URL;
      try {
        process.env.API_PUBLIC_URL = 'https://api.custom-domain.com';
        const res = qrTarget({
          publicToken: 'tok-env',
          settings: { qr: { enabled: true, type: 'proposal' } },
        });
        expect(res?.url).toBe('https://api.custom-domain.com/q/tok-env');
      } finally {
        process.env.API_PUBLIC_URL = oldEnv;
      }
    });

    it('generates QR target for consultant without phone when company has whatsapp', () => {
      const res = qrTarget({
        publicToken: 'tok-c',
        consultant: { name: 'Consultor', phone: undefined },
        companyWhatsapp: '11 97777-6666',
        settings: { qr: { enabled: true, type: 'consultant' } },
      });
      expect(res).not.toBeNull();
      expect(res?.destination).toContain('https://wa.me/5511977776666');
    });
  });
});
