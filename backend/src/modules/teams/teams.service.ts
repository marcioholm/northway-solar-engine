import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class TeamsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(companyId: string) {
    const db = this.supabase.getClient();
    
    const { data, error } = await db.from('teams')
      .select('*, members:team_members(*), projects(id, client_name, estimated_start, estimated_end, status, system_power_kwp)')
      .eq('company_id', companyId)
      .eq('active', true);
      
    if (error) throw error;
    return data;
  }
}
