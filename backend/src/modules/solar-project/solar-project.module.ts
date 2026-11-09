import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolarProject } from './entities/solar-project.entity';
import { Quote } from './entities/quote.entity';
import { QuoteItem } from './entities/quote-item.entity';
import { Lead } from '../leads/entities/lead.entity';
import { SolarProjectController } from './solar-project.controller';
import { SolarProjectService } from './solar-project.service';
import { QuoteService } from './quote.service';

@Module({
  imports: [TypeOrmModule.forFeature([SolarProject, Quote, QuoteItem, Lead])],
  controllers: [SolarProjectController],
  providers: [SolarProjectService, QuoteService],
  exports: [SolarProjectService, QuoteService],
})
export class SolarProjectModule {}
