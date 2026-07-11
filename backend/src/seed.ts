import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompaniesService } from './modules/companies/companies.service';
import { UsersService } from './modules/users/users.service';
import { InventoryService } from './modules/inventory/inventory.service';
import { UserRole } from './modules/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const companiesService = app.get(CompaniesService);
    const usersService = app.get(UsersService);
    const inventoryService = app.get(InventoryService);

    // 1. Create Companies
    console.log('Seeding Companies...');
    const solarNorte = await companiesService.create({
        name: 'SolarNorte',
        baseCity: 'Manaus - AM',
        costPerKm: 1.5,
        defaultMargin: 20, // 20%
        lossFactor: 0.85,
    });

    const solarSul = await companiesService.create({
        name: 'SolarSul',
        baseCity: 'Porto Alegre - RS',
        costPerKm: 2.0,
        defaultMargin: 25, // 25%
        lossFactor: 0.90,
    });

    // 2. Create Users
    console.log('Seeding Users...');
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash('123456', salt);

    await usersService.create({
        name: 'Admin Norte',
        email: 'admin@solarnorte.com.br',
        passwordHash,
        role: UserRole.ADMIN,
        companyId: solarNorte.id,
    });

    await usersService.create({
        name: 'Admin Sul',
        email: 'admin@solarsul.com.br',
        passwordHash,
        role: UserRole.ADMIN,
        companyId: solarSul.id,
    });

    // 3. Create Inventory
    console.log('Seeding Inventory...');

    // Modules for Norte
    await inventoryService.createModule(solarNorte.id, {
        brand: 'Canadian Solar',
        model: '550W HiKu6',
        powerWatt: 550,
        cost: 800.00,
        active: true,
    });

    // Inverters for Norte
    await inventoryService.createInverter(solarNorte.id, {
        brand: 'Growatt',
        model: 'MIN 5000TL-X',
        nominalPowerKw: 5.0,
        cost: 3500.00,
        active: true,
    });

    // Modules for Sul
    await inventoryService.createModule(solarSul.id, {
        brand: 'Jinko Solar',
        model: '545W Tiger Neo',
        powerWatt: 545,
        cost: 780.00,
        active: true,
    });

    // Inverters for Sul
    await inventoryService.createInverter(solarSul.id, {
        brand: 'Solis',
        model: 'S5-GR1P5K',
        nominalPowerKw: 5.0,
        cost: 3200.00,
        active: true,
    });

    console.log('Seeding Complete!');
    await app.close();
}

bootstrap();
