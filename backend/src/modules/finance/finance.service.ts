import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class FinanceService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardData(companyId: string) {
    const db = this.supabase.getClient();

    const { data: projects } = await db.from('projects').select('id, client_name, system_power_kwp, sale_price, margin_percent').eq('company_id', companyId);
    
    const faturado =
      projects?.reduce((acc, p) => acc + Number(p.sale_price || 0), 0) || 0;

    // Recebimentos e vencimentos entram quando o módulo de pagamentos existir.
    return {
      faturado,
      margemMedia: projects?.length
        ? projects.reduce((acc, p) => acc + Number(p.margin_percent || 0), 0) /
          projects.length
        : 0,
      margens:
        projects?.slice(0, 10).map((p) => ({
          cliente: p.client_name,
          kwp: p.system_power_kwp,
          margem: p.margin_percent,
        })) || [],
    };
  }
}
