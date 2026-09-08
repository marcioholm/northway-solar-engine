import { Injectable, NotFoundException } from '@nestjs/common';
import { IrradiationService } from '../irradiation/irradiation.service';
import { CompaniesService } from '../companies/companies.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SolarEngineService {
  constructor(
    private irradiationService: IrradiationService,
    private companiesService: CompaniesService,
    private inventoryService: InventoryService,
  ) {}

  async calculate(
    companyId: string,
    consumption: number,
    city: string,
    moduleId?: string,
    inverterId?: string,
    moduleQtyOverride?: number,
  ) {
    // 1. Get Company Config
    const company = await this.companiesService.findOne(companyId);
    if (!company) throw new NotFoundException('Company not found');

    // 2. Get Irradiation
    const irradiation = await this.irradiationService.getIrradiation(city);
    const generationPerKwp = irradiation.monthly_generation_per_kwp;

    // 3. Calculate Required Power
    // Power (kWp) = Consumption / (Gen/kWp * LossFactor)
    const requiredPowerKwp =
      consumption / (generationPerKwp * Number(company.lossFactor));

    // 4. Select Module
    const modules = await this.inventoryService.findAllModules(companyId);
    if (!modules.length) throw new NotFoundException('No modules in inventory');

    let selectedModule;
    if (moduleId) {
      selectedModule = modules.find((m) => m.id === moduleId);
      if (!selectedModule)
        throw new NotFoundException('Selected module not found in inventory');
    } else {
      selectedModule = modules[0];
    }

    // 5. Calculate Module Qty
    let moduleQty: number;
    if (moduleQtyOverride) {
      moduleQty = moduleQtyOverride;
    } else {
      moduleQty = Math.ceil(
        (requiredPowerKwp * 1000) / selectedModule.powerWatt,
      );
    }
    const systemPowerKwp = (moduleQty * selectedModule.powerWatt) / 1000;

    // 6. Select Inverter
    const inverters = await this.inventoryService.findAllInverters(companyId);
    let selectedInverter;
    if (inverterId) {
      selectedInverter = inverters.find((inv) => inv.id === inverterId);
      if (!selectedInverter)
        throw new NotFoundException('Selected inverter not found in inventory');
    } else {
      const compatible = inverters.filter((inv) => {
        const ratio = Number(inv.nominalPowerKw) / systemPowerKwp;
        return ratio >= 0.9 && ratio <= 1.25;
      });
      if (!compatible.length) {
        compatible.push(
          inverters.sort(
            (a, b) =>
              Math.abs(Number(a.nominalPowerKw) - systemPowerKwp) -
              Math.abs(Number(b.nominalPowerKw) - systemPowerKwp),
          )[0],
        );
      }
      compatible.sort((a, b) => Number(a.cost) - Number(b.cost));
      selectedInverter = compatible[0];
    }

    // 7. Calculate Costs
    const costModules = moduleQty * Number(selectedModule.cost);
    const costInverter = Number(selectedInverter.cost);

    // Heuristic costs if not in DB
    const costStructure = systemPowerKwp * 300; // R$ 300/kWp approx
    const costLabor = systemPowerKwp * 400; // R$ 400/kWp approx
    const costTravel = 0; // Calculated in TravelService, here assumed 0 or handled outside. Wait, requirement says "Inclua custo de deslocamento".
    // I need TravelService for that. I haven't implemented it yet.
    // I will add a method in SolarEngine to accept distance or call TravelService.
    // For now, I'll update this later or assume city is base city (dist=0).

    const subtotal =
      costModules + costInverter + costStructure + costLabor + costTravel;

    // 8. Financials
    // Price = Cost / (1 - Margin)
    const margin = Number(company.defaultMargin) / 100;
    const finalPrice = subtotal / (1 - margin);
    const marginValue = finalPrice - subtotal;

    // Payback
    // Savings = Generation * EnergyPrice (approx 0.90 R$/kWh)
    // Generation = systemPowerKwp * generationPerKwp * lossFactor ? No, actually (Power * Gen/kWp * Loss) should equal Consumption roughly.
    // Actually estimated generation = systemPowerKwp * generationPerKwp * lossFactor
    const estimatedMonthlyGen =
      systemPowerKwp * generationPerKwp * Number(company.lossFactor);
    const energyPrice = 0.95; // Average tariff
    const monthlySavings = estimatedMonthlyGen * energyPrice;
    const annualSavings = monthlySavings * 12;
    const paybackYears = finalPrice / annualSavings;

    return {
      system_power_kwp: systemPowerKwp,
      module_qty: moduleQty,
      module: selectedModule,
      inverter: selectedInverter,
      cost_modules: costModules,
      cost_inverter: costInverter,
      cost_structure: costStructure,
      cost_labor: costLabor,
      cost_travel: costTravel,
      subtotal,
      margin_pct: Number(company.defaultMargin),
      margin_value: marginValue,
      final_price: finalPrice,
      payback_years: paybackYears,
      monthly_generation: estimatedMonthlyGen,
    };
  }
}
