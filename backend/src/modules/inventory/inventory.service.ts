import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryModuleEntity } from './entities/inventory-module.entity';
import { InventoryInverterEntity } from './entities/inventory-inverter.entity';
import { CreateInventoryModuleDto } from './dto/create-inventory-module.dto';
import { CreateInventoryInverterDto } from './dto/create-inventory-inverter.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryModuleEntity)
    private modulesRepo: Repository<InventoryModuleEntity>,
    @InjectRepository(InventoryInverterEntity)
    private invertersRepo: Repository<InventoryInverterEntity>,
  ) {}

  // Modules
  createModule(companyId: string, dto: CreateInventoryModuleDto) {
    const item = this.modulesRepo.create({ ...dto, companyId });
    return this.modulesRepo.save(item);
  }

  findAllModules(companyId: string) {
    return this.modulesRepo.findBy({ companyId, active: true });
  }

  // Inverters
  createInverter(companyId: string, dto: CreateInventoryInverterDto) {
    const item = this.invertersRepo.create({ ...dto, companyId });
    return this.invertersRepo.save(item);
  }

  findAllInverters(companyId: string) {
    return this.invertersRepo.findBy({ companyId, active: true });
  }

  // Find helpers
  findModuleById(id: string, companyId: string) {
    return this.modulesRepo.findOneBy({ id, companyId });
  }

  findInverterById(id: string, companyId: string) {
    return this.invertersRepo.findOneBy({ id, companyId });
  }
}
