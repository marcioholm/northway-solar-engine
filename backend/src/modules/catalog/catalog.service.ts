import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogSupplier } from './entities/catalog-supplier.entity';
import { CatalogKit } from './entities/catalog-kit.entity';
import { CatalogManufacturer } from './entities/catalog-manufacturer.entity';
import {
  CatalogDocument,
  DocumentType,
} from './entities/catalog-document.entity';
import { CreateCatalogProductDto } from './dto/create-catalog-product.dto';
import { UpdateCatalogProductDto } from './dto/update-catalog-product.dto';
import { CreateCatalogSupplierDto } from './dto/create-catalog-supplier.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';
import { paginate, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(CatalogProduct)
    private productsRepo: Repository<CatalogProduct>,
    @InjectRepository(CatalogSupplier)
    private suppliersRepo: Repository<CatalogSupplier>,
    @InjectRepository(CatalogKit)
    private kitsRepo: Repository<CatalogKit>,
    @InjectRepository(CatalogManufacturer)
    private manufacturersRepo: Repository<CatalogManufacturer>,
    @InjectRepository(CatalogDocument)
    private documentsRepo: Repository<CatalogDocument>,
  ) {}

  // ─── Products ────────────────────────────────────────

  async createProduct(
    companyId: string,
    userId: string,
    dto: CreateCatalogProductDto,
  ): Promise<CatalogProduct> {
    const product = this.productsRepo.create({
      category: dto.category,
      brand: dto.brand,
      line: dto.line,
      model: dto.model,
      sku: dto.sku,
      purchasePrice: dto.purchasePrice,
      suggestedPrice: dto.suggestedPrice,
      unit: dto.unit || 'un',
      active: dto.active ?? true,
      manufacturerId: dto.manufacturerId,
      stockQuantity: dto.stockQuantity ?? 0,
      minStock: dto.minStock ?? 0,
      warrantyYears: dto.warrantyYears,
      specs: dto.specs || {},
      compatibility: dto.compatibility || {},
      tags: dto.tags || [],
      supplierId: dto.supplierId,
      companyId,
      createdBy: userId,
    });
    return this.productsRepo.save(product);
  }

  async findAllProducts(
    companyId: string,
    query: CatalogQueryDto,
  ): Promise<PaginatedResult<CatalogProduct>> {
    const where: any = { companyId };
    if (query.category) where.category = query.category;
    if (query.brand) where.brand = query.brand;
    if (query.active !== undefined) where.active = query.active === 'true';
    if (query.supplierId) where.supplierId = query.supplierId;
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;
    const order = { brand: 'ASC' as const, model: 'ASC' as const };
    if (query.q) {
      const [data, total] = await this.productsRepo.findAndCount({
        where: [
          { ...where, brand: Like(`%${query.q}%`) },
          { ...where, model: Like(`%${query.q}%`) },
          { ...where, line: Like(`%${query.q}%`) },
        ],
        order,
        skip,
        take: limit,
      });
      return paginate(data, total, page, limit);
    }
    const [data, total] = await this.productsRepo.findAndCount({
      where,
      order,
      skip,
      take: limit,
    });
    return paginate(data, total, page, limit);
  }

  async findProduct(id: string, companyId: string): Promise<CatalogProduct> {
    const product = await this.productsRepo.findOne({
      where: { id, companyId },
      relations: ['supplier'],
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async updateProduct(
    id: string,
    companyId: string,
    dto: UpdateCatalogProductDto,
  ): Promise<CatalogProduct> {
    const product = await this.findProduct(id, companyId);
    Object.assign(product, dto);
    return this.productsRepo.save(product);
  }

  async removeProduct(id: string, companyId: string): Promise<void> {
    const product = await this.findProduct(id, companyId);
    product.active = false;
    await this.productsRepo.save(product);
  }

  async findCompatible(
    companyId: string,
    category: string,
    refId: string,
  ): Promise<CatalogProduct[]> {
    const ref = await this.findProduct(refId, companyId);
    const compatKeys = Object.keys(ref.compatibility || {});
    if (compatKeys.length === 0) return [];

    const targetCategory = category || compatKeys[0];
    const compatibleIds = ref.compatibility[targetCategory] || [];
    if (compatibleIds.length === 0) return [];

    return this.productsRepo
      .find({
        where: { companyId, category: targetCategory as any, active: true },
      })
      .then((products) => products.filter((p) => compatibleIds.includes(p.id)));
  }

  async getDistinctBrands(
    companyId: string,
    category?: string,
  ): Promise<string[]> {
    const where: any = { companyId };
    if (category) where.category = category;
    const results = await this.productsRepo.find({ where, select: ['brand'] });
    return [...new Set(results.map((p) => p.brand))].sort();
  }

  async getStats(
    companyId: string,
  ): Promise<{ category: string; total: number; active: number }[]> {
    const all = await this.productsRepo.find({ where: { companyId } });
    const groups: Record<string, { total: number; active: number }> = {};
    for (const p of all) {
      if (!groups[p.category]) groups[p.category] = { total: 0, active: 0 };
      groups[p.category].total++;
      if (p.active) groups[p.category].active++;
    }
    return Object.entries(groups).map(([category, counts]) => ({
      category,
      ...counts,
    }));
  }

  // ─── Manufacturers ──────────────────────────────────

  async createManufacturer(
    companyId: string,
    dto: {
      name: string;
      website?: string;
      contact?: string;
      email?: string;
      phone?: string;
      country?: string;
    },
  ): Promise<CatalogManufacturer> {
    const m = this.manufacturersRepo.create({ ...dto, companyId });
    return this.manufacturersRepo.save(m);
  }

  findAllManufacturers(companyId: string): Promise<CatalogManufacturer[]> {
    return this.manufacturersRepo.find({
      where: { companyId, active: true },
      order: { name: 'ASC' },
    });
  }

  async findManufacturer(id: string, companyId: string): Promise<CatalogManufacturer> {
    const m = await this.manufacturersRepo.findOneBy({ id, companyId });
    if (!m) throw new NotFoundException('Manufacturer not found');
    return m;
  }

  async updateManufacturer(
    id: string,
    companyId: string,
    dto: Partial<{
      name: string;
      website: string;
      contact: string;
      email: string;
      phone: string;
      country: string;
    }>,
  ): Promise<CatalogManufacturer> {
    const m = await this.findManufacturer(id, companyId);
    Object.assign(m, dto);
    return this.manufacturersRepo.save(m);
  }

  async removeManufacturer(id: string, companyId: string): Promise<void> {
    const m = await this.findManufacturer(id, companyId);
    m.active = false;
    await this.manufacturersRepo.save(m);
  }

  // ─── Documents ──────────────────────────────────────

  async createDocument(companyId: string, dto: {
    productId: string;
    type: DocumentType;
    name: string;
    description?: string;
    fileUrl: string;
    fileType?: string;
    language?: string;
  }): Promise<CatalogDocument> {
    await this.findProduct(dto.productId, companyId);
    const doc = new CatalogDocument();
    Object.assign(doc, dto);
    return this.documentsRepo.save(doc);
  }

  async findDocumentsByProduct(productId: string, companyId: string): Promise<CatalogDocument[]> {
    await this.findProduct(productId, companyId);
    return this.documentsRepo.find({
      where: { productId, active: true },
      order: { createdAt: 'DESC' as any },
    });
  }

  async removeDocument(id: string, companyId: string): Promise<void> {
    const doc = await this.documentsRepo.findOne({ where: { id }, relations: ['product'] });
    if (!doc || doc.product?.companyId !== companyId) throw new NotFoundException('Document not found');
    doc.active = false;
    await this.documentsRepo.save(doc);
  }

  // ─── Suppliers ───────────────────────────────────────

  async createSupplier(
    companyId: string,
    dto: CreateCatalogSupplierDto,
  ): Promise<CatalogSupplier> {
    const supplier = this.suppliersRepo.create({ ...dto, companyId });
    return this.suppliersRepo.save(supplier);
  }

  findAllSuppliers(companyId: string): Promise<CatalogSupplier[]> {
    return this.suppliersRepo.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }

  async findSupplier(id: string, companyId: string): Promise<CatalogSupplier> {
    const supplier = await this.suppliersRepo.findOneBy({ id, companyId });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async updateSupplier(
    id: string,
    companyId: string,
    dto: Partial<CreateCatalogSupplierDto>,
  ): Promise<CatalogSupplier> {
    const supplier = await this.findSupplier(id, companyId);
    Object.assign(supplier, dto);
    return this.suppliersRepo.save(supplier);
  }

  async removeSupplier(id: string, companyId: string): Promise<void> {
    const supplier = await this.findSupplier(id, companyId);
    supplier.active = false;
    await this.suppliersRepo.save(supplier);
  }

  // ─── Kits ─────────────────────────────────────────────

  async createKit(
    companyId: string,
    userId: string,
    dto: {
      name: string;
      description?: string;
      suggestedPrice?: number;
      items?: { productId: string; qty: number }[];
      services?: { type: string; value: number }[];
    },
  ): Promise<CatalogKit> {
    const kit = this.kitsRepo.create({
      name: dto.name,
      description: dto.description,
      suggestedPrice: dto.suggestedPrice,
      items: (dto.items || []) as any,
      services: (dto.services || []) as any,
      companyId,
      createdBy: userId,
    });
    return this.kitsRepo.save(kit);
  }

  findAllKits(companyId: string): Promise<CatalogKit[]> {
    return this.kitsRepo.find({ where: { companyId }, order: { name: 'ASC' } });
  }

  async findKit(id: string, companyId: string): Promise<CatalogKit> {
    const kit = await this.kitsRepo.findOneBy({ id, companyId });
    if (!kit) throw new NotFoundException('Kit not found');
    return kit;
  }

  async removeKit(id: string, companyId: string): Promise<void> {
    const kit = await this.findKit(id, companyId);
    await this.kitsRepo.delete(kit.id);
  }
}
