import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class IntelligenceService {
  constructor(private readonly supabase: SupabaseService) {}

  async getDashboardData(companyId: string) {
    const db = this.supabase.getClient();

    // In a real scenario, we'd use materialized views. 
    // Here we simulate the aggregated response structure.
    
    // 1. Funnel (Leads -> Proposals -> Won)
    const { count: leadsCount } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    const { count: proposalsCount } = await db.from('proposals').select('*', { count: 'exact', head: true }).eq('company_id', companyId);
    const { count: wonCount } = await db.from('leads').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('stage', 'closed_won');

    // 2. ROI by Campaign (Aggregating UTMs)
    const { data: campaigns } = await db.from('leads').select('utm_campaign, stage').eq('company_id', companyId).not('utm_campaign', 'is', null);

    // 3. Seller Performance
    const { data: sellers } = await db.from('projects').select('id, sale_price, lead:leads(created_by)').eq('company_id', companyId);

    return {
      funnel: [
        { name: 'Leads', count: leadsCount || 0 },
        { name: 'Proposta Enviada', count: proposalsCount || 0 },
        { name: 'Proposta Visualizada', count: Math.floor((proposalsCount || 0) * 0.4) }, // Mock
        { name: 'Em Negociação', count: Math.floor((wonCount || 0) * 1.5) }, // Mock
        { name: 'Ganho', count: wonCount || 0 },
      ],
      roi: [
        { campaign: 'Google Ads', leads: 40, proposals: 12, sales: 3, revenue: 72000, cpa: 133 },
        { campaign: 'Instagram', leads: 28, proposals: 10, sales: 4, revenue: 95000, cpa: 0 },
        { campaign: 'Indicação', leads: 15, proposals: 9, sales: 6, revenue: 168000, cpa: 0 },
      ],
      forecast: {
        next30: 89400,
        next60: 156200,
        next90: 198000,
      },
      sellers: [
        { name: 'Vendedor 1', leads: 18, proposals: 12, sales: 5, revenue: 124000, avgCycle: 14 },
      ]
    };
  }
}
