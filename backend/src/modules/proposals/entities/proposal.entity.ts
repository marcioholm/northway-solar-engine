import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryModuleEntity } from '../../inventory/entities/inventory-module.entity';
import { InventoryInverterEntity } from '../../inventory/entities/inventory-inverter.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('proposals')
export class Proposal {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id', nullable: true })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

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

    @Column({ name: 'system_power_kwp', type: 'float' })
    systemPowerKwp: number;

    @Column({ name: 'module_id', nullable: true })
    moduleId: string;

    @ManyToOne(() => InventoryModuleEntity)
    @JoinColumn({ name: 'module_id' })
    module: InventoryModuleEntity;

    @Column({ name: 'inverter_id', nullable: true })
    inverterId: string;

    @ManyToOne(() => InventoryInverterEntity)
    @JoinColumn({ name: 'inverter_id' })
    inverter: InventoryInverterEntity;

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
