import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogProduct } from './entities/catalog-product.entity';
import { CatalogSupplier } from './entities/catalog-supplier.entity';
import { CatalogKit } from './entities/catalog-kit.entity';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
    imports: [TypeOrmModule.forFeature([CatalogProduct, CatalogSupplier, CatalogKit])],
    controllers: [CatalogController],
    providers: [CatalogService],
    exports: [CatalogService],
})
export class CatalogModule { }
