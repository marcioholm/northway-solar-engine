import { Module } from '@nestjs/common';
import { SolarEngineService } from './solar-engine.service';
import { SolarEngineController } from './solar-engine.controller'; // Note: file name might be solar-engine-controller.ts or solar-engine.controller.ts. Step 199 created solar-engine-controller.ts. I should check the file name or rename it. I'll check step 199. It says `solar-engine-controller.ts`. Best practice is `solar-engine.controller.ts`. I will rename it or import it as is. I'll import as is for now but usually `nest g` creates `.controller.ts`. I manually created it. I'll stick to what I created.
import { IrradiationModule } from '../irradiation/irradiation.module';
import { CompaniesModule } from '../companies/companies.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [IrradiationModule, CompaniesModule, InventoryModule],
  controllers: [SolarEngineController],
  providers: [SolarEngineService],
  exports: [SolarEngineService],
})
export class SolarEngineModule {}
