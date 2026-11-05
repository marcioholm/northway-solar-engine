import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class IntelligenceService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardData(companyId: string) {
    const db = this.supabase.getClient();

    const count = async (table: string, stage?: string) => {
      let query = db
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('company_id', companyId);
      if (stage) query = query.eq('stage', stage);
      const { count: total } = await query;
      return total || 0;
    };

    // Só etapas medidas de verdade. ROI, previsão e ranking voltam com dados reais.
    return {
      funnel: [
        { name: 'Leads', count: await count('leads') },
        { name: 'Proposta Enviada', count: await count('proposals') },
        { name: 'Ganho', count: await count('leads', 'closed_won') },
      ],
    };
  }
}
