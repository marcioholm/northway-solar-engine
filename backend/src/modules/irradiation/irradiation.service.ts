import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class IrradiationService {
    private readonly irradiationTable = {
        'AC': 4.8, 'AL': 5.5, 'AP': 4.8, 'AM': 4.8, 'BA': 5.5, 'CE': 5.5, 'DF': 5.3, 'ES': 4.9,
        'GO': 5.3, 'MA': 5.5, 'MT': 5.3, 'MS': 5.3, 'MG': 4.9, 'PA': 4.8, 'PB': 5.5, 'PR': 4.5,
        'PE': 5.5, 'PI': 5.5, 'RJ': 4.9, 'RN': 5.5, 'RS': 4.5, 'RO': 4.8, 'RR': 4.8, 'SC': 4.5,
        'SP': 4.9, 'SE': 5.5, 'TO': 4.8
    };

    private readonly regionMap = {
        'NORTE': 4.8, 'NORDESTE': 5.5, 'CENTRO-OESTE': 5.3, 'SUDESTE': 4.9, 'SUL': 4.5
    };

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    async getIrradiation(location: string): Promise<any> {
        // Try cache
        const cached = await this.cacheManager.get(location);
        if (cached) {
            return cached;
        }

        // Logic: Try to find by state code (2 chars) or map to region
        // For MVP, simplistic mapping via state code suffix "City - UF"
        let hsp = 4.5; // Default fallback (South)
        const upperLoc = location.toUpperCase();

        // Check if location is just a state code
        if (this.irradiationTable[upperLoc]) {
            hsp = this.irradiationTable[upperLoc];
        } else {
            // Try to extract UF from "City - UF" or "City, UF"
            const match = upperLoc.match(/[-,\s]\s*([A-Z]{2})$/);
            if (match && this.irradiationTable[match[1]]) {
                hsp = this.irradiationTable[match[1]];
            }
        }

        const result = {
            monthly_generation_per_kwp: hsp * 30, // HSP * 30 days
            annual_irradiation: hsp * 365,
            source: 'static_table_br'
        };

        // Cache for 1 day
        await this.cacheManager.set(location, result, 86400000); // 1 day in ms (v5) or seconds (v4)? NestJS cache manager usually uses ms in v5.

        return result;
    }
}
