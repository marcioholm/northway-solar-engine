import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('whatsapp_instances')
export class WhatsappInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ name: 'seller_id', nullable: true })
  sellerId: string;

  @Column({ name: 'instance_name' })
  instanceName: string;

  @Column({ name: 'api_url' })
  apiUrl: string;

  @Column({ name: 'api_key' })
  apiKey: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ default: 'disconnected' })
  status: string;

  @Column({ name: 'connected_at', type: 'timestamp', nullable: true })
  connectedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
