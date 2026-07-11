import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Proposal } from '../../proposals/entities/proposal.entity';
import { Quote } from './quote.entity';

@Entity('solar_project')
export class SolarProject {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'lead_id', nullable: true })
    leadId: string;

    @Column({ name: 'created_by' })
    createdBy: string;

    @Column({ name: 'updated_by', nullable: true })
    updatedBy: string;

    @Column({ default: 'draft' })
    status: string;

    // ───────────────────── CLIENT ─────────────────────

    @Column({ name: 'client_name', nullable: true })
    clientName: string;

    @Column({ name: 'client_document', nullable: true })
    clientDocument: string;

    @Column({ name: 'client_phone', nullable: true })
    clientPhone: string;

    @Column({ name: 'client_email', nullable: true })
    clientEmail: string;

    @Column({ name: 'client_city', nullable: true })
    clientCity: string;

    @Column({ name: 'client_state', nullable: true })
    clientState: string;

    @Column({ name: 'client_zipcode', nullable: true })
    clientZipcode: string;

    @Column({ name: 'client_utility', nullable: true })
    clientUtility: string;

    @Column({ name: 'client_class', nullable: true })
    clientClass: string;

    @Column({ name: 'client_tariff_group', nullable: true })
    clientTariffGroup: string;

    @Column({ name: 'client_modality', nullable: true })
    clientModality: string;

    @Column({ name: 'consultant_name', nullable: true })
    consultantName: string;

    // ───────────────────── SITE ─────────────────────

    @Column({ name: 'site_address', nullable: true })
    siteAddress: string;

    @Column({ name: 'site_zipcode', nullable: true })
    siteZipcode: string;

    @Column({ name: 'site_latitude', type: 'float', nullable: true })
    siteLatitude: number;

    @Column({ name: 'site_longitude', type: 'float', nullable: true })
    siteLongitude: number;

    @Column({ name: 'site_roof_type', nullable: true })
    siteRoofType: string;

    @Column({ name: 'site_inclination', type: 'float', nullable: true })
    siteInclination: number;

    @Column({ name: 'site_azimuth', type: 'float', nullable: true })
    siteAzimuth: number;

    @Column({ name: 'site_photos', type: 'jsonb', default: '[]' })
    sitePhotos: string[];

    // ───────────────────── CONSUMPTION ─────────────────────

    @Column({ name: 'consumption_monthly_kwh', type: 'float', nullable: true })
    consumptionMonthlyKwh: number;

    @Column({ name: 'consumption_monthly_bill', type: 'float', nullable: true })
    consumptionMonthlyBill: number;

    @Column({ name: 'consumption_tariff', type: 'float', nullable: true })
    consumptionTariff: number;

    @Column({ name: 'consumption_demand', type: 'float', nullable: true })
    consumptionDemand: number;

    @Column({ name: 'consumption_modality', nullable: true })
    consumptionModality: string;

    @Column({ name: 'consumption_group', nullable: true })
    consumptionGroup: string;

    @Column({ name: 'consumption_invoices', type: 'jsonb', default: '[]' })
    consumptionInvoices: Array<{ month: string; consumption: number; bill: number }>;

    // ───────────────────── SIZING ─────────────────────

    @Column({ name: 'sizing_power_kwp', type: 'float', nullable: true })
    sizingPowerKwp: number;

    @Column({ name: 'sizing_generation_kwh', type: 'float', nullable: true })
    sizingGenerationKwh: number;

    @Column({ name: 'sizing_irradiation', type: 'float', nullable: true })
    sizingIrradiation: number;

    @Column({ name: 'sizing_loss_factor', type: 'float', nullable: true })
    sizingLossFactor: number;

    @Column({ name: 'sizing_module_qty', type: 'int', nullable: true })
    sizingModuleQty: number;

    @Column({ name: 'sizing_inverter_qty', type: 'int', nullable: true })
    sizingInverterQty: number;

    @Column({ name: 'sizing_observations', type: 'text', nullable: true })
    sizingObservations: string;

    // ───────────────────── EQUIPMENT ─────────────────────

    @Column({ type: 'jsonb', default: '[]' })
    equipmentModules: Array<{ catalogId: string; name: string; brand: string; model: string; power: number; qty: number; unitPrice: number }>;

    @Column({ type: 'jsonb', default: '[]' })
    equipmentInverters: Array<{ catalogId: string; name: string; brand: string; model: string; powerKw: number; qty: number; unitPrice: number }>;

    @Column({ type: 'jsonb', default: '[]' })
    equipmentStructures: Array<{ catalogId: string; name: string; qty: number; unitPrice: number }>;

    @Column({ type: 'jsonb', default: '[]' })
    equipmentCables: Array<{ catalogId: string; name: string; qty: number; unitPrice: number }>;

    // ───────────────────── PRICING ─────────────────────

    @Column({ name: 'pricing_equipment_cost', type: 'float', nullable: true })
    pricingEquipmentCost: number;

    @Column({ name: 'pricing_labor_cost', type: 'float', nullable: true })
    pricingLaborCost: number;

    @Column({ name: 'pricing_project_cost', type: 'float', nullable: true })
    pricingProjectCost: number;

    @Column({ name: 'pricing_freight_cost', type: 'float', nullable: true })
    pricingFreightCost: number;

    @Column({ name: 'pricing_travel_cost', type: 'float', nullable: true })
    pricingTravelCost: number;

    @Column({ name: 'pricing_commission', type: 'float', nullable: true })
    pricingCommission: number;

    @Column({ name: 'pricing_taxes', type: 'float', nullable: true })
    pricingTaxes: number;

    @Column({ name: 'pricing_admin_cost', type: 'float', nullable: true })
    pricingAdminCost: number;

    @Column({ name: 'pricing_margin_pct', type: 'float', nullable: true })
    pricingMarginPct: number;

    @Column({ name: 'pricing_margin_value', type: 'float', nullable: true })
    pricingMarginValue: number;

    @Column({ name: 'pricing_min_price', type: 'float', nullable: true })
    pricingMinPrice: number;

    @Column({ name: 'pricing_final_price', type: 'float', nullable: true })
    pricingFinalPrice: number;

    @Column({ name: 'pricing_discount_pct', type: 'float', nullable: true })
    pricingDiscountPct: number;

    // ───────────────────── PAYMENT ─────────────────────

    @Column({ name: 'payment_cash_discount', type: 'float', nullable: true })
    paymentCashDiscount: number;

    @Column({ name: 'payment_card_tax', type: 'float', nullable: true })
    paymentCardTax: number;

    @Column({ name: 'payment_card_installments', type: 'int', nullable: true })
    paymentCardInstallments: number;

    @Column({ name: 'payment_finance_tax', type: 'float', nullable: true })
    paymentFinanceTax: number;

    @Column({ name: 'payment_finance_installments', type: 'int', nullable: true })
    paymentFinanceInstallments: number;

    @Column({ name: 'payment_validity_days', type: 'int', default: 10 })
    paymentValidityDays: number;

    // ───────────────────── LEGACY JSONB MODULES (deprecated) ─────────────────────

    @Column({ type: 'jsonb', default: {} })
    client: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    consumption: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    site: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    sizing: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    equipment: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    pricing: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    payment: Record<string, any>;

    // ───────────────────── EXTRA (catch-all) ─────────────────────

    @Column({ type: 'jsonb', default: {} })
    extra: Record<string, any>;

    // ───────────────────── RELATIONSHIPS ─────────────────────

    @OneToMany(() => Proposal, p => p.solarProject)
    proposals: Proposal[];

    @OneToMany(() => Quote, q => q.solarProject)
    quotes: Quote[];

    // ───────────────────── TIMESTAMPS ─────────────────────

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
