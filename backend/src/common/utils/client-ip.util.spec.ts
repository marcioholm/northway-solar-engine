import { clientIp } from './client-ip.util';

describe('clientIp utility', () => {
  it('usa x-vercel-forwarded-for (primeiro IP) com prioridade máxima', () => {
    const req = {
      headers: {
        'x-vercel-forwarded-for': '203.0.113.195, 10.0.0.1',
        'x-forwarded-for': '198.51.100.4',
      },
      ip: '127.0.0.1',
    };
    expect(clientIp(req)).toBe('203.0.113.195');
  });

  it('faz trim no IP de x-vercel-forwarded-for', () => {
    const req = {
      headers: {
        'x-vercel-forwarded-for': '   203.0.113.50   ',
      },
    };
    expect(clientIp(req)).toBe('203.0.113.50');
  });

  it('usa x-forwarded-for (primeiro IP) quando x-vercel-forwarded-for não existir', () => {
    const req = {
      headers: {
        'x-forwarded-for': '198.51.100.22, 192.168.1.1',
      },
      ip: '127.0.0.1',
    };
    expect(clientIp(req)).toBe('198.51.100.22');
  });

  it('faz fallback para req.ip quando nenhum cabeçalho de proxy estiver presente', () => {
    const req = {
      headers: {},
      ip: '192.168.1.100',
    };
    expect(clientIp(req)).toBe('192.168.1.100');
  });

  it('faz fallback para req.connection.remoteAddress se req.ip for indefinido', () => {
    const req = {
      headers: {},
      connection: { remoteAddress: '10.10.10.10' },
    };
    expect(clientIp(req)).toBe('10.10.10.10');
  });

  it('retorna string vazia quando nenhum IP for encontrado', () => {
    expect(clientIp(null)).toBe('');
    expect(clientIp({})).toBe('');
    expect(clientIp({ headers: {} })).toBe('');
  });
});
