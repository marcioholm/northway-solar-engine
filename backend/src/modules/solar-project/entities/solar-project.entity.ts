import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
