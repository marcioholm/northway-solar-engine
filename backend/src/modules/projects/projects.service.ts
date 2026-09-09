import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(companyId: string) {
    const { data, error } = await this.supabase.getClient()
      .from('projects')
      .select(`
        *,
        team:teams(name, color),
        lead:leads(name)
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findOne(companyId: string, id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('projects')
      .select(`
        *,
        team:teams(name, color),
        checklists:project_checklist(*),
        logs:project_status_log(*),
        documents:project_documents(*),
        costs:project_costs(*),
        payments:project_payments(*)
      `)
      .eq('company_id', companyId)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(companyId: string, id: string, newStatus: string, userId: string) {
    const db = this.supabase.getClient();
    
    // Get current status
    const { data: project } = await db
      .from('projects')
      .select('status')
      .eq('id', id)
      .eq('company_id', companyId)
      .single();

    if (!project) throw new Error('Project not found');

    const fromStatus = project.status;
    if (fromStatus === newStatus) return;

    // Update project
    const { error } = await db
      .from('projects')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) throw error;

    // Log status change
    await db.from('project_status_log').insert({
      project_id: id,
      from_status: fromStatus,
      to_status: newStatus,
      changed_by: userId
    });

    return { success: true };
  }
}
