import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryModuleDto } from './dto/create-inventory-module.dto';
import { CreateInventoryInverterDto } from './dto/create-inventory-inverter.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('modules')
  createModule(@Request() req, @Body() dto: CreateInventoryModuleDto) {
    return this.inventoryService.createModule(req.user.companyId, dto);
  }

  @Get('modules')
  findAllModules(@Request() req) {
    return this.inventoryService.findAllModules(req.user.companyId);
  }

  @Post('inverters')
  createInverter(@Request() req, @Body() dto: CreateInventoryInverterDto) {
    return this.inventoryService.createInverter(req.user.companyId, dto);
  }

  @Get('inverters')
  findAllInverters(@Request() req) {
    return this.inventoryService.findAllInverters(req.user.companyId);
  }
}
