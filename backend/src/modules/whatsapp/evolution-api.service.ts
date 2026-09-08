import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsappInstance } from './entities/whatsapp-instance.entity';

@Injectable()
export class EvolutionApiService {
  private readonly logger = new Logger(EvolutionApiService.name);

  constructor(
    @InjectRepository(WhatsappInstance)
    private readonly instanceRepository: Repository<WhatsappInstance>,
  ) {}

  async sendMessage(instanceId: string, phone: string, text: string) {
    const instance = await this.instanceRepository.findOne({ where: { id: instanceId } });
    if (!instance) {
      throw new Error('WhatsApp instance not found');
    }

    try {
      const response = await fetch(`${instance.apiUrl}/message/sendText/${instance.instanceName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': instance.apiKey,
        },
        body: JSON.stringify({
          number: phone,
          options: {
            delay: 1200,
            presence: 'composing',
          },
          textMessage: {
            text,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Failed to send message: ${err}`);
      }

      return await response.json();
    } catch (error: any) {
      this.logger.error(`Error sending message via Evolution API: ${error.message}`);
      throw error;
    }
  }

  async createInstance(companyId: string, instanceName: string, apiUrl: string, apiKey: string, sellerId?: string) {
    // Basic setup for creating connection
    const instance = this.instanceRepository.create({
      companyId,
      instanceName,
      apiUrl,
      apiKey,
      sellerId,
      status: 'connecting',
    });
    return this.instanceRepository.save(instance);
  }

  async getQrCode(instanceId: string) {
    const instance = await this.instanceRepository.findOne({ where: { id: instanceId } });
    if (!instance) {
      throw new Error('WhatsApp instance not found');
    }
    // Assume Evolution API exposes /instance/connect endpoint to get base64 QR
    const response = await fetch(`${instance.apiUrl}/instance/connect/${instance.instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': instance.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get QR code');
    }
    return response.json();
  }
}
