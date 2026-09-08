import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from '../leads/entities/lead.entity';
import { MetaConversionLog } from './entities/meta-conversion-log.entity';
import * as crypto from 'crypto';

@Injectable()
export class MetaAdsService {
  private readonly logger = new Logger(MetaAdsService.name);

  constructor(
    @InjectRepository(MetaConversionLog)
    private readonly logsRepo: Repository<MetaConversionLog>,
  ) {}

  private hashData(data: string): string {
    if (!data) return '';
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  }

  async sendPurchaseEvent(lead: Lead, datasetId: string, accessToken: string) {
    if (!datasetId || !accessToken) return;
    
    // Hash email and phone
    const emailHash = this.hashData(lead.email);
    // Sanitize phone: keep only numbers
    const rawPhone = (lead.phone || '').replace(/\D/g, '');
    // Usually Meta expects country code, we assume 55 for Brazil if not present but let's just hash rawPhone for now
    const phoneHash = rawPhone ? this.hashData(rawPhone.length <= 11 ? `55${rawPhone}` : rawPhone) : '';

    const matchKeys: any = {};
    if (emailHash) matchKeys.em = [emailHash];
    if (phoneHash) matchKeys.ph = [phoneHash];
    if (lead.fbclid) matchKeys.fbc = lead.fbclid;

    const payload = {
      data: [
        {
          event_name: 'Purchase',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: matchKeys,
          custom_data: {
            currency: 'BRL',
            value: lead.value || 0,
          },
        }
      ]
    };

    const log = this.logsRepo.create({
      companyId: lead.companyId,
      leadId: lead.id,
      eventName: 'Purchase',
      payload,
      status: 'queued',
    });
    await this.logsRepo.save(log);

    try {
      const response = await fetch(`https://graph.facebook.com/v18.0/${datasetId}/events?access_token=${accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error?.message || 'Meta API error');
      }

      log.status = 'sent';
      log.response = resData;
      await this.logsRepo.save(log);
    } catch (err: any) {
      this.logger.error(`Failed to send Meta conversion for lead ${lead.id}: ${err.message}`);
      log.status = 'failed';
      log.response = { error: err.message };
      await this.logsRepo.save(log);
    }
  }
}
