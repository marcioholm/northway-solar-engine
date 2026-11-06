import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface ProposalStat {
  value: string;
  label: string;
}

export interface ProposalContact {
  address?: string;
  phone?: string;
  website?: string;
  instagram?: string;
  whatsapp?: string;
}

export interface ProposalSectionsEnabled {
  cover?: boolean;
  about?: boolean;
  stats?: boolean;
  technical?: boolean;
  equipment?: boolean;
  financial?: boolean;
  kit?: boolean;
  warranties?: boolean;
  partners?: boolean;
  contact?: boolean;
}

@Entity('proposal_settings')
export class ProposalSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', unique: true })
  companyId: string;

  @Column({ default: 'moderno' })
  template: 'classico' | 'moderno' | 'minimalista';

  @Column({ name: 'primary_color', default: '#FFB703' })
  primaryColor: string;

  @Column({ name: 'secondary_color', default: '#0F172A' })
  secondaryColor: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'about_text', type: 'text', nullable: true })
  aboutText?: string;

  @Column({ name: 'about_image_url', nullable: true })
  aboutImageUrl?: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  stats: ProposalStat[];

  @Column({ name: 'partner_logos', type: 'jsonb', default: () => "'[]'" })
  partnerLogos: string[];

  @Column({ name: 'brand_logos', type: 'jsonb', default: () => "'[]'" })
  brandLogos: string[];

  @Column({ name: 'service_area_text', type: 'text', nullable: true })
  serviceAreaText?: string;

  @Column({ name: 'included_items', type: 'jsonb', default: () => "'[]'" })
  includedItems: string[];

  @Column({ name: 'warranties_text', type: 'text', nullable: true })
  warrantiesText?: string;

  @Column({ name: 'exclusions_text', type: 'text', nullable: true })
  exclusionsText?: string;

  @Column({ name: 'notes_text', type: 'text', nullable: true })
  notesText?: string;

  @Column({ name: 'acceptance_text', type: 'text', nullable: true })
  acceptanceText?: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  contact: ProposalContact;

  @Column({ name: 'sections_enabled', type: 'jsonb', default: () => "'{}'" })
  sectionsEnabled: ProposalSectionsEnabled;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
