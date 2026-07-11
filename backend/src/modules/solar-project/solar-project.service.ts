import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolarProject } from './entities/solar-project.entity';
import { CreateSolarProjectDto } from './dto/create-solar-project.dto';
import { UpdateSolarProjectDto } from './dto/update-solar-project.dto';

@Injectable()
export class SolarProjectService {
    constructor(
        @InjectRepository(SolarProject)
        private repository: Repository<SolarProject>,
    ) { }

    async create(companyId: string, userId: string, dto: CreateSolarProjectDto): Promise<SolarProject> {
        const project = this.repository.create({
            companyId,
            createdBy: userId,
            status: 'draft',
            client: (dto.client || {}) as any,
            consumption: (dto.consumption || {}) as any,
            site: (dto.site || {}) as any,
        });
        if (dto.leadId) project.leadId = dto.leadId;
        return this.repository.save(project);
    }

    findAll(companyId: string): Promise<SolarProject[]> {
        return this.repository.find({
            where: { companyId },
            order: { updatedAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<SolarProject> {
        const project = await this.repository.findOneBy({ id });
        if (!project) throw new NotFoundException('SolarProject not found');
        return project;
    }

    async update(id: string, dto: UpdateSolarProjectDto): Promise<SolarProject> {
        const project = await this.findOne(id);
        const allowedModules = ['client', 'consumption', 'site', 'sizing', 'equipment', 'pricing', 'payment'] as const;
        for (const mod of allowedModules) {
            if (dto[mod] !== undefined) {
                (project as any)[mod] = { ...(project as any)[mod], ...dto[mod] };
            }
        }
        if (dto.status !== undefined) project.status = dto.status;
        return this.repository.save(project);
    }

    async updateModule(id: string, module: string, data: Record<string, any>): Promise<SolarProject> {
        const project = await this.findOne(id);
        const allowed = ['client', 'consumption', 'site', 'sizing', 'equipment', 'pricing', 'payment'];
        if (!allowed.includes(module)) throw new NotFoundException(`Module '${module}' not found`);
        (project as any)[module] = { ...(project as any)[module], ...data };
        return this.repository.save(project);
    }

    async updateStatus(id: string, status: string): Promise<SolarProject> {
        const project = await this.findOne(id);
        project.status = status;
        return this.repository.save(project);
    }

    getByLead(leadId: string): Promise<SolarProject[]> {
        return this.repository.find({ where: { leadId }, order: { createdAt: 'DESC' } });
    }

    async remove(id: string): Promise<void> {
        const project = await this.findOne(id);
        await this.repository.remove(project);
    }
}
