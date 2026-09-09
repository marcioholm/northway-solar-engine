import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class FinanceService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardData(companyId: string) {
    const db = this.supabase.getClient();

    const { data: projects } = await db.from('projects').select('id, client_name, system_power_kwp, sale_price, margin_percent').eq('company_id', companyId);
    
    // Simplification for the POC:
    const faturado = projects?.reduce((acc, p) => acc + (p.sale_price || 0), 0) || 0;
    
    return {
      faturado,
      recebido: faturado * 0.7, // mock
      aReceber: faturado * 0.3, // mock
      margemMedia: projects?.length ? projects.reduce((acc, p) => acc + (p.margin_percent || 0), 0) / projects.length : 0,
      vencimentos: [
        { cliente: 'João Silva', valor: 11375, status: 'venceu há 2 dias', color: 'red' },
        { cliente: 'Maria Lima', valor: 9200, status: 'vence em 3 dias', color: 'yellow' },
      ],
      margens: projects?.slice(0, 10).map(p => ({
        cliente: p.client_name,
        kwp: p.system_power_kwp,
        margem: p.margin_percent
      })) || []
    };
  }
}
