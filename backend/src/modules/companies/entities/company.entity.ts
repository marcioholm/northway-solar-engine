import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ name: 'base_city' })
    baseCity: string;

    @Column({ name: 'base_lat', type: 'float', nullable: true })
    baseLat: number;

    @Column({ name: 'base_lng', type: 'float', nullable: true })
    baseLng: number;

    @Column({ name: 'cost_per_km', type: 'decimal', precision: 10, scale: 2, default: 0 })
    costPerKm: number;

    @Column({ name: 'default_margin', type: 'decimal', precision: 5, scale: 2, default: 0 })
    defaultMargin: number;

    @Column({ name: 'loss_factor', type: 'decimal', precision: 5, scale: 2, default: 0.8 })
    lossFactor: number;

    @Column({ name: 'card_tax', type: 'decimal', precision: 5, scale: 2, default: 15 })
    cardTax: number;

    @Column({ name: 'finance_tax', type: 'decimal', precision: 5, scale: 2, default: 20 })
    financeTax: number;

    @Column({ name: 'cash_discount', type: 'decimal', precision: 5, scale: 2, default: 5 })
    cashDiscount: number;

    @Column({ name: 'logo_url', nullable: true })
    logoUrl: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
