import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { CatalogSupplier } from './catalog-supplier.entity';

export type ProductCategory = 'module' | 'inverter' | 'structure' | 'cable' | 'connector' | 'protection' | 'service';

@Entity('catalog_products')
export class CatalogProduct {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column()
    category: ProductCategory;

    @Column({ name: 'supplier_id', nullable: true })
    supplierId: string;

    @ManyToOne(() => CatalogSupplier, { nullable: true })
    @JoinColumn({ name: 'supplier_id' })
    supplier: CatalogSupplier;

    @Column()
    brand: string;

    @Column({ nullable: true })
    line: string;

    @Column()
    model: string;

    @Column({ nullable: true })
    sku: string;

    @Column({ name: 'purchase_price', type: 'decimal', precision: 10, scale: 2 })
    purchasePrice: number;

    @Column({ name: 'suggested_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
    suggestedPrice: number;

    @Column({ default: 'un' })
    unit: string;

    @Column({ default: true })
    active: boolean;

    @Column({ type: 'jsonb', default: {} })
    specs: Record<string, any>;

    @Column({ type: 'jsonb', default: {} })
    compatibility: Record<string, any>;

    @Column({ type: 'text', array: true, default: '{}' })
    tags: string[];

    @Column({ nullable: true })
    datasheetUrl: string;

    @Column({ nullable: true })
    manualUrl: string;

    @Column({ nullable: true })
    certificateUrl: string;

    @Column({ nullable: true })
    imageUrl: string;

    @Column({ type: 'jsonb', default: '[]' })
    priceHistory: Array<{ price: number; date: string; supplier?: string }>;

    @Column({ name: 'created_by' })
    createdBy: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
