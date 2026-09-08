import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaAdsService } from './meta-ads.service';
import { MetaConversionLog } from './entities/meta-conversion-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetaConversionLog])],
  providers: [MetaAdsService],
  exports: [MetaAdsService],
})
export class MetaAdsModule {}
