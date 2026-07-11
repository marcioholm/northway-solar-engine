import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { IrradiationController } from './irradiation.controller';
import { IrradiationService } from './irradiation.service';

@Module({
  imports: [CacheModule.register()],
  controllers: [IrradiationController],
  providers: [IrradiationService],
  exports: [IrradiationService],
})
export class IrradiationModule { }
