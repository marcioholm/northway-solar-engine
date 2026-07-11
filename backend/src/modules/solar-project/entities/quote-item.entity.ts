import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quote } from './quote.entity';

@Entity('quote_items')
export class QuoteItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'quote_id' })
    quoteId: string;

    @ManyToOne(() => Quote, q => q.items)
    @JoinColumn({ name: 'quote_id' })
    quote: Quote;

    @Column({ name: 'catalog_product_id', nullable: true })
    catalogProductId: string;

    @Column({ name: 'product_type' })
    productType: string;

    @Column({ name: 'product_name', nullable: true })
    productName: string;

    @Column({ name: 'product_brand', nullable: true })
    productBrand: string;

    @Column({ name: 'product_model', nullable: true })
    productModel: string;

    @Column({ type: 'int' })
    quantity: number;

    @Column({ name: 'unit_price', type: 'decimal', precision: 10, scale: 2 })
    unitPrice: number;

    @Column({ name: 'total_price', type: 'decimal', precision: 12, scale: 2 })
    totalPrice: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
