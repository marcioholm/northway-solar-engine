import { GeoService } from './geo.service';

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(() => {
    service = new GeoService();
    service.onModuleInit();
  });

  it('returns empty array if query has fewer than 2 characters', () => {
    expect(service.searchCities('a')).toEqual([]);
    expect(service.searchCities('')).toEqual([]);
  });

  it('finds cities with accent-insensitive search', () => {
    // "sao paulo" without accent should find "São Paulo"
    const results = service.searchCities('sao paulo');
    expect(results.length).toBeGreaterThan(0);
    const sp = results.find((c) => c.name === 'São Paulo');
    expect(sp).toBeDefined();
    expect(sp?.uf).toBe('SP');
    expect(sp?.ibge).toBe('3550308');
  });

  it('filters cities by UF when provided', () => {
    const results = service.searchCities('santo', 'SP');
    expect(results.length).toBeGreaterThan(0);
    results.forEach((c) => {
      expect(c.uf).toBe('SP');
    });
  });

  it('prioritizes prefix matches over mid-string matches', () => {
    const results = service.searchCities('campi');
    expect(results.length).toBeGreaterThan(0);
    // Campinas should appear before something like "São José do Campinho"
    expect(results[0].name.toLowerCase().startsWith('campi')).toBe(true);
  });
});

