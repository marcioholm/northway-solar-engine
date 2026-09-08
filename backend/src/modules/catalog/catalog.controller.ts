import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCatalogProductDto } from './dto/create-catalog-product.dto';
import { UpdateCatalogProductDto } from './dto/update-catalog-product.dto';
import { CreateCatalogSupplierDto } from './dto/create-catalog-supplier.dto';
import { CatalogQueryDto } from './dto/catalog-query.dto';

@ApiTags('catalog')
@Controller('catalog')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class CatalogController {
  constructor(private readonly service: CatalogService) {}

  // ─── Products ─────────────────────────────────────────

  @Post('products')
  @ApiOperation({ summary: 'Create catalog product' })
  createProduct(@Request() req, @Body() dto: CreateCatalogProductDto) {
    return this.service.createProduct(req.user.companyId, req.user.userId, dto);
  }

  @Get('products')
  @ApiOperation({ summary: 'List catalog products' })
  findAllProducts(@Request() req, @Query() query: CatalogQueryDto) {
    return this.service.findAllProducts(req.user.companyId, query);
  }

  @Get('products/stats')
  @ApiOperation({ summary: 'Product stats by category' })
  getStats(@Request() req) {
    return this.service.getStats(req.user.companyId);
  }

  @Get('products/brands')
  @ApiOperation({ summary: 'Distinct brands' })
  getBrands(@Request() req, @Query('category') category?: string) {
    return this.service.getDistinctBrands(req.user.companyId, category);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get product details' })
  findProduct(@Param('id') id: string, @Request() req) {
    return this.service.findProduct(id, req.user.companyId);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateCatalogProductDto, @Request() req) {
    return this.service.updateProduct(id, req.user.companyId, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Deactivate product' })
  removeProduct(@Param('id') id: string, @Request() req) {
    return this.service.removeProduct(id, req.user.companyId);
  }

  @Get('products/:id/compatible')
  @ApiOperation({ summary: 'Get compatible products' })
  findCompatible(
    @Request() req,
    @Param('id') id: string,
    @Query('category') category: string,
  ) {
    return this.service.findCompatible(req.user.companyId, category, id);
  }

  // ─── Suppliers ────────────────────────────────────────

  @Post('suppliers')
  @ApiOperation({ summary: 'Create supplier' })
  createSupplier(@Request() req, @Body() dto: CreateCatalogSupplierDto) {
    return this.service.createSupplier(req.user.companyId, dto);
  }

  @Get('suppliers')
  @ApiOperation({ summary: 'List suppliers' })
  findAllSuppliers(@Request() req) {
    return this.service.findAllSuppliers(req.user.companyId);
  }

  @Get('suppliers/:id')
  @ApiOperation({ summary: 'Get supplier' })
  findSupplier(@Param('id') id: string, @Request() req) {
    return this.service.findSupplier(id, req.user.companyId);
  }

  @Patch('suppliers/:id')
  @ApiOperation({ summary: 'Update supplier' })
  updateSupplier(
    @Param('id') id: string,
    @Body() dto: CreateCatalogSupplierDto,
    @Request() req,
  ) {
    return this.service.updateSupplier(id, req.user.companyId, dto);
  }

  @Delete('suppliers/:id')
  @ApiOperation({ summary: 'Deactivate supplier' })
  removeSupplier(@Param('id') id: string, @Request() req) {
    return this.service.removeSupplier(id, req.user.companyId);
  }

  // ─── Kits ─────────────────────────────────────────────

  @Post('kits')
  @ApiOperation({ summary: 'Create kit' })
  createKit(
    @Request() req,
    @Body()
    dto: {
      name: string;
      description?: string;
      suggestedPrice?: number;
      items?: { productId: string; qty: number }[];
      services?: { type: string; value: number }[];
    },
  ) {
    return this.service.createKit(req.user.companyId, req.user.userId, dto);
  }

  @Get('kits')
  @ApiOperation({ summary: 'List kits' })
  findAllKits(@Request() req) {
    return this.service.findAllKits(req.user.companyId);
  }

  @Get('kits/:id')
  @ApiOperation({ summary: 'Get kit' })
  findKit(@Param('id') id: string, @Request() req) {
    return this.service.findKit(id, req.user.companyId);
  }

  @Delete('kits/:id')
  @ApiOperation({ summary: 'Delete kit' })
  removeKit(@Param('id') id: string, @Request() req) {
    return this.service.removeKit(id, req.user.companyId);
  }

  // ─── Manufacturers ────────────────────────────────────

  @Post('manufacturers')
  @ApiOperation({ summary: 'Create manufacturer' })
  createManufacturer(
    @Request() req,
    @Body()
    dto: {
      name: string;
      website?: string;
      contact?: string;
      email?: string;
      phone?: string;
      country?: string;
    },
  ) {
    return this.service.createManufacturer(req.user.companyId, dto);
  }

  @Get('manufacturers')
  @ApiOperation({ summary: 'List manufacturers' })
  findAllManufacturers(@Request() req) {
    return this.service.findAllManufacturers(req.user.companyId);
  }

  @Get('manufacturers/:id')
  @ApiOperation({ summary: 'Get manufacturer' })
  findManufacturer(@Param('id') id: string, @Request() req) {
    return this.service.findManufacturer(id, req.user.companyId);
  }

  @Patch('manufacturers/:id')
  @ApiOperation({ summary: 'Update manufacturer' })
  updateManufacturer(
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      website?: string;
      contact?: string;
      email?: string;
      phone?: string;
      country?: string;
    },
    @Request() req,
  ) {
    return this.service.updateManufacturer(id, req.user.companyId, dto);
  }

  @Delete('manufacturers/:id')
  @ApiOperation({ summary: 'Deactivate manufacturer' })
  removeManufacturer(@Param('id') id: string, @Request() req) {
    return this.service.removeManufacturer(id, req.user.companyId);
  }

  // ─── Documents ────────────────────────────────────────

  @Post('products/:id/documents')
  @ApiOperation({ summary: 'Upload document for product' })
  createDocument(
    @Param('id') productId: string,
    @Body()
    dto: {
      type: string;
      name: string;
      description?: string;
      fileUrl: string;
      fileType?: string;
      language?: string;
    },
    @Request() req,
  ) {
    return this.service.createDocument(req.user.companyId, {
      ...dto,
      productId,
      type: dto.type as any,
    });
  }

  @Get('products/:id/documents')
  @ApiOperation({ summary: 'List documents for product' })
  findDocuments(@Param('id') id: string, @Request() req) {
    return this.service.findDocumentsByProduct(id, req.user.companyId);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Remove document' })
  removeDocument(@Param('id') id: string, @Request() req) {
    return this.service.removeDocument(id, req.user.companyId);
  }
}
