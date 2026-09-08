import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { SolarProject } from './entities/solar-project.entity';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@Injectable()
export class QuoteService {
  constructor(
    @InjectRepository(Quote)
    private quoteRepository: Repository<Quote>,
    @InjectRepository(QuoteItem)
    private itemRepository: Repository<QuoteItem>,
    @InjectRepository(SolarProject)
    private projectRepository: Repository<SolarProject>,
  ) {}

  async create(
    projectId: string,
    companyId: string,
    userId: string,
    dto: CreateQuoteDto,
  ): Promise<Quote> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Project not found');

    const itemsTotal = dto.items.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0,
    );

    const quote = this.quoteRepository.create({
      solarProjectId: projectId,
      createdBy: userId,
      supplierName: dto.supplierName,
      supplierContact: dto.supplierContact,
      supplierPhone: dto.supplierPhone,
      supplierEmail: dto.supplierEmail,
      quoteNumber: dto.quoteNumber,
      quoteDate: dto.quoteDate,
      validUntil: dto.validUntil,
      paymentCondition: dto.paymentCondition,
      status: dto.status || 'draft',
      shippingCost: dto.shippingCost || 0,
      notes: dto.notes,
      totalAmount: itemsTotal + (dto.shippingCost || 0),
      selected: false,
      items: dto.items.map((i) =>
        this.itemRepository.create({
          productType: i.productType,
          productName: i.productName,
          productBrand: i.productBrand,
          productModel: i.productModel,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          totalPrice: i.quantity * i.unitPrice,
        }),
      ),
    });

    return this.quoteRepository.save(quote);
  }

  async findByProject(projectId: string, companyId: string): Promise<Quote[]> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Project not found');
    
    return this.quoteRepository.find({
      where: { solarProjectId: projectId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({
      where: { id },
      relations: ['items', 'solarProject'],
    });
    if (!quote || quote.solarProject.companyId !== companyId) {
      throw new NotFoundException('Quote not found');
    }
    return quote;
  }

  async update(id: string, companyId: string, dto: UpdateQuoteDto): Promise<Quote> {
    const quote = await this.findOne(id, companyId);
    if (dto.validUntil) quote.validUntil = dto.validUntil;
    Object.assign(quote, dto);
    return this.quoteRepository.save(quote);
  }

  async select(projectId: string, companyId: string, quoteId: string): Promise<Quote> {
    const quote = await this.findOne(quoteId, companyId);
    if (quote.solarProjectId !== projectId) {
      throw new BadRequestException('Quote does not belong to this project');
    }

    // Deselect all other quotes in the project
    await this.quoteRepository.update(
      { solarProjectId: projectId, selected: true },
      { selected: false },
    );

    // Select this one
    quote.selected = true;
    return this.quoteRepository.save(quote);
  }

  async getSelected(projectId: string, companyId: string): Promise<Quote | null> {
    const project = await this.projectRepository.findOne({ where: { id: projectId, companyId } });
    if (!project) throw new NotFoundException('Project not found');

    const quote = await this.quoteRepository.findOne({
      where: { solarProjectId: projectId, selected: true },
      relations: ['items'],
    });
    return quote || null;
  }

  async remove(id: string, companyId: string): Promise<void> {
    const quote = await this.findOne(id, companyId);
    await this.quoteRepository.remove(quote);
  }
}
