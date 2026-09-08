import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CatalogProduct } from './catalog-product.entity';

export type DocumentType =
  | 'datasheet'
  | 'warranty'
  | 'certificate'
  | 'manual'
  | 'brochure'
  | 'technical_note'
  | 'other';

@Entity('catalog_documents')
export class CatalogDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => CatalogProduct, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: CatalogProduct;

  @Column({ length: 32 })
  type: DocumentType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_type', nullable: true, length: 16 })
  fileType: string;

  @Column({ nullable: true })
  language: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
