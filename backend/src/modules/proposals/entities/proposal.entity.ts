import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { SolarProject } from '../../solar-project/entities/solar-project.entity';
import { Quote } from '../../solar-project/entities/quote.entity';

@Entity('proposals')
export class Proposal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ────────── Data source references ──────────

    @Column({ name: 'solar_project_id', nullable: true })
    solarProjectId: string;

    @ManyToOne(() => SolarProject)
    @JoinColumn({ name: 'solar_project_id' })
    solarProject: SolarProject;

    @Column({ name: 'quote_id', nullable: true })
    quoteId: string;

    @ManyToOne(() => Quote)
    @JoinColumn({ name: 'quote_id' })
    quote: Quote;

    @Column({ name: 'template_name', default: 'default' })
    templateName: string;

    @Column({ type: 'jsonb', default: {} })
    settings: Record<string, any>;

    // ────────── Company ──────────

    @Column({ name: 'company_id', nullable: true })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    // ────────── Client snapshot (denormalized for render speed) ──────────

    @Column({ name: 'client_name' })
    clientName: string;

    @Column({ name: 'client_cep' })
    clientCep: string;

    @Column({ name: 'client_city' })
    clientCity: string;

    @Column({ name: 'utility', nullable: true })
    utility: string;

    @Column({ name: 'tariff', type: 'float', nullable: true })
    tariff: number;

    @Column({ name: 'profile', nullable: true })
    profile: string;

    @Column({ name: 'consumption_kwh', type: 'float' })
    consumptionKwh: number;

    // ────────── Legacy fields (kept for backward compatibility) ──────────

    @Column({ name: 'system_power_kwp', type: 'float' })
    systemPowerKwp: number;

    // Deprecated: kept for backward compatibility. Use catalog_product fields for new proposals.
    @Column({ name: 'module_id', nullable: true })
    moduleId: string;

    @Column({ name: 'inverter_id', nullable: true })
    inverterId: string;

    // Future: Catalog Product references
    @Column({ name: 'catalog_product_module_id', nullable: true })
    catalogProductModuleId: string;

    @Column({ name: 'catalog_product_inverter_id', nullable: true })
    catalogProductInverterId: string;

    @Column({ name: 'module_qty', type: 'int' })
    moduleQty: number;

    @Column({ name: 'cost_modules', type: 'decimal', precision: 10, scale: 2 })
    costModules: number;

    @Column({ name: 'cost_inverter', type: 'decimal', precision: 10, scale: 2 })
    costInverter: number;

    @Column({ name: 'cost_labor', type: 'decimal', precision: 10, scale: 2 })
    costLabor: number;

    @Column({ name: 'cost_structure', type: 'decimal', precision: 10, scale: 2 })
    costStructure: number;

    @Column({ name: 'cost_travel', type: 'decimal', precision: 10, scale: 2 })
    costTravel: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    subtotal: number;

    @Column({ name: 'margin_pct', type: 'decimal', precision: 5, scale: 2 })
    marginPct: number;

    @Column({ name: 'margin_value', type: 'decimal', precision: 10, scale: 2 })
    marginValue: number;

    @Column({ name: 'final_price', type: 'decimal', precision: 10, scale: 2 })
    finalPrice: number;

    @Column({ name: 'payback_years', type: 'float' })
    paybackYears: number;

    // ────────── Metadata ──────────

    @Column({ name: 'pdf_path', nullable: true })
    pdfPath: string;

    @Column({ name: 'lead_id', nullable: true })
    leadId: string;

    @Column({ name: 'stage', nullable: true })
    stage: string;

    @Column({ name: 'created_by' })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
