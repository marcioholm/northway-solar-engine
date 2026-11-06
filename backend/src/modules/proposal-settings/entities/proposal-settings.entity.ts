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

export interface ServiceAreaCity {
  ibge: string;
  name: string;
  uf: string;
  lat: number;
  lon: number;
}

export interface ProposalServiceArea {
  style?: 'brasil' | 'zoom' | 'estados';
  states: string[];
  cities: ServiceAreaCity[];
}

export interface ProposalQrSettings {
  enabled: boolean;
  type: 'proposal' | 'consultant' | 'whatsapp' | 'site' | 'instagram' | 'custom';
  value?: string;
  message?: string;
  label?: string;
}

export interface ProposalHighlight {
  icon: 'team' | 'support' | 'gauge' | 'helmet';
  title: string;
  text: string;
}

@Entity('proposal_settings')
export class ProposalSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id', unique: true })
  companyId: string;

  @Column({ default: 'moderno' })
  template: 'classico' | 'moderno' | 'minimalista';

  @Column({ name: 'primary_color', default: '#1F2937' })
  primaryColor: string;

  @Column({ name: 'secondary_color', default: '#F59E0B' })
  secondaryColor: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'cover_focus', default: 'center' })
  coverFocus: 'top' | 'center' | 'bottom';

  @Column({ name: 'about_text', type: 'text', nullable: true })
  aboutText?: string;

  @Column({ name: 'about_image_url', nullable: true })
  aboutImageUrl?: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  stats: ProposalStat[];

  @Column({ name: 'highlights', type: 'jsonb', default: () => "'[]'" })
  highlights: ProposalHighlight[];

  @Column({ name: 'partner_logos', type: 'jsonb', default: () => "'[]'" })
  partnerLogos: string[];

  @Column({ name: 'brand_logos', type: 'jsonb', default: () => "'[]'" })
  brandLogos: string[];

  @Column({ name: 'service_area', type: 'jsonb', default: () => "'{\"style\":\"zoom\",\"states\":[],\"cities\":[]}'" })
  serviceArea: ProposalServiceArea;

  @Column({ name: 'service_area_text', type: 'text', nullable: true })
  serviceAreaText?: string;

  @Column({ name: 'included_items', type: 'jsonb', default: () => "'[]'" })
  includedItems: string[];

  @Column({ name: 'kit_image_url', nullable: true })
  kitImageUrl?: string;

  @Column({ name: 'services_text', type: 'text', nullable: true })
  servicesText?: string;

  @Column({ name: 'warranties_text', type: 'text', nullable: true })
  warrantiesText?: string;

  @Column({ name: 'exclusions_text', type: 'text', nullable: true })
  exclusionsText?: string;

  @Column({ name: 'notes_text', type: 'text', nullable: true })
  notesText?: string;

  @Column({ name: 'acceptance_text', type: 'text', nullable: true })
  acceptanceText?: string;

  @Column({ name: 'qr', type: 'jsonb', default: () => "'{\"enabled\":true,\"type\":\"proposal\",\"value\":\"\",\"message\":\"\",\"label\":\"\"}'" })
  qr: ProposalQrSettings;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  contact: ProposalContact;

  @Column({ name: 'sections_enabled', type: 'jsonb', default: () => "'{}'" })
  sectionsEnabled: ProposalSectionsEnabled;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
