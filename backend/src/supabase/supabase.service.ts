import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('SUPABASE_URL');
    const key = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (url && key) {
      this.client = createClient(url, key, {
        auth: { persistSession: false },
      });
      this.logger.log('Supabase client initialized');
    } else {
      this.logger.warn('Supabase credentials not configured');
    }
  }

  getClient(): SupabaseClient {
    return this.client;
  }

  async uploadFile(
    bucket: string,
    path: string,
    file: Buffer,
    contentType: string,
  ) {
    if (!this.client) throw new Error('Supabase not configured');
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file, { contentType, upsert: true });
    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string): Promise<string | null> {
    if (!this.client) return null;
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string) {
    if (!this.client) return;
    await this.client.storage.from(bucket).remove([path]);
  }
}
