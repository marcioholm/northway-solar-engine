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

export interface FutureLoadCatalogItem {
  id: string;
  name: string;
  category?: string;
  powerKw?: number;
  fixedKwh?: number;
  defaultHoursPerDay?: number;
  defaultDaysPerMonth?: number;
}

export interface ProposalSizingRules {
  folgaPct: number;
  expansaoPct: number;
}

export const DEFAULT_SIZING_RULES: ProposalSizingRules = {
  folgaPct: 10,
  expansaoPct: 25,
};

export const DEFAULT_FUTURE_LOADS: FutureLoadCatalogItem[] = [
  { id: 'ac_inv_9000', name: 'Ar-condicionado inverter 9.000 BTU', category: 'Climatização', powerKw: 0.50, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_12000', name: 'Ar-condicionado inverter 12.000 BTU', category: 'Climatização', powerKw: 0.65, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_18000', name: 'Ar-condicionado inverter 18.000 BTU', category: 'Climatização', powerKw: 1.00, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_inv_24000', name: 'Ar-condicionado inverter 24.000 BTU', category: 'Climatização', powerKw: 1.30, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'ac_conv_12000', name: 'Ar-condicionado convencional 12.000 BTU', category: 'Climatização', powerKw: 1.10, defaultHoursPerDay: 8, defaultDaysPerMonth: 30 },
  { id: 'carro_eletrico', name: 'Carro elétrico', category: 'Mobilidade', fixedKwh: 180, defaultHoursPerDay: 0, defaultDaysPerMonth: 30 },
  { id: 'chuveiro_5500', name: 'Chuveiro elétrico 5,5 kW', category: 'Eletrodomésticos', powerKw: 5.50, defaultHoursPerDay: 0.5, defaultDaysPerMonth: 30 },
  { id: 'bomba_piscina_750', name: 'Bomba de piscina 0,75 kW', category: 'Lazer', powerKw: 0.75, defaultHoursPerDay: 6, defaultDaysPerMonth: 30 },
];

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

export interface ProposalPaymentCard {
  installments?: number;
  totalMarkupPct?: number;
}

export interface ProposalPaymentFinanceOption {
  n: number;
  totalMarkupPct: number;
}

export interface ProposalPaymentOwnPlan {
  downPaymentPct?: number;
  installments?: number;
}

export interface ProposalPaymentDefaults {
  cashDiscountPct?: number | null;
  card?: ProposalPaymentCard | null;
  finance?: ProposalPaymentFinanceOption[] | null;
  own?: ProposalPaymentOwnPlan | null;
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

  @Column({ name: 'payment_defaults', type: 'jsonb', default: () => "'{}'" })
  paymentDefaults: ProposalPaymentDefaults;

  @Column({ name: 'sizing_rules', type: 'jsonb', default: () => "'{\"folgaPct\": 10, \"expansaoPct\": 25}'" })
  sizingRules: ProposalSizingRules;

  @Column({ name: 'future_loads', type: 'jsonb', default: () => "'[]'" })
  futureLoads: FutureLoadCatalogItem[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
