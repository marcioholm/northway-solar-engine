import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { SolarProject } from './solar-project.entity';
import { QuoteItem } from './quote-item.entity';

@Entity('quotes')
export class Quote {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'solar_project_id' })
    solarProjectId: string;

    @ManyToOne(() => SolarProject, p => p.quotes)
    @JoinColumn({ name: 'solar_project_id' })
    solarProject: SolarProject;

    @Column({ name: 'supplier_name', nullable: true })
    supplierName: string;

    @Column({ name: 'supplier_contact', nullable: true })
    supplierContact: string;

    @Column({ name: 'supplier_phone', nullable: true })
    supplierPhone: string;

    @Column({ name: 'supplier_email', nullable: true })
    supplierEmail: string;

    @Column({ default: 'draft' })
    status: string;

    @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalAmount: number;

    @Column({ name: 'shipping_cost', type: 'decimal', precision: 10, scale: 2, default: 0 })
    shippingCost: number;

    @Column({ name: 'valid_until', nullable: true })
    validUntil: Date;

    @Column({ type: 'text', nullable: true })
    notes: string;

    @Column({ name: 'created_by' })
    createdBy: string;

    @OneToMany(() => QuoteItem, i => i.quote, { cascade: true })
    items: QuoteItem[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
