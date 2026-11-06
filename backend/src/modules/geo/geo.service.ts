import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { MUNICIPIOS_DATA } from './data/municipios.data';

export interface CityData {
  ibge: string;
  name: string;
  uf: string;
  lat: number;
  lon: number;
}

interface InternalCityData extends CityData {
  normalizedName: string;
}

const normalizeStr = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

@Injectable()
export class GeoService implements OnModuleInit {
  private readonly logger = new Logger(GeoService.name);
  private cities: InternalCityData[] = [];

  onModuleInit() {
    this.loadCities();
  }

  private loadCities() {
    this.cities = MUNICIPIOS_DATA.map((c) => ({
      ibge: c.ibge,
      name: c.name,
      uf: c.uf,
      lat: c.lat,
      lon: c.lon,
      normalizedName: normalizeStr(c.name),
    }));
    this.logger.log(`Carregados ${this.cities.length} municípios do IBGE`);
  }

  searchCities(query: string, uf?: string, limit = 20): CityData[] {
    const q = normalizeStr(query || '');
    if (q.length < 2) return [];

    const targetUf = uf ? uf.trim().toUpperCase() : undefined;

    const filtered = this.cities.filter((c) => {
      if (targetUf && c.uf !== targetUf) return false;
      return c.normalizedName.includes(q);
    });

    filtered.sort((a, b) => {
      const aStarts = a.normalizedName.startsWith(q);
      const bStarts = b.normalizedName.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name, 'pt-BR');
    });

    return filtered.slice(0, limit).map(({ ibge, name, uf: cUf, lat, lon }) => ({
      ibge,
      name,
      uf: cUf,
      lat,
      lon,
    }));
  }
}
