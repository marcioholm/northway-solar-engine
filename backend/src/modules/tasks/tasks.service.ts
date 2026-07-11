import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private tasksRepository: Repository<Task>,
    ) { }

    create(companyId: string, userId: string, dto: CreateTaskDto) {
        const task = this.tasksRepository.create({
            ...dto,
            companyId,
            createdBy: userId,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        });
        return this.tasksRepository.save(task);
    }

    findAll(companyId: string) {
        return this.tasksRepository.find({
            where: { companyId },
            order: { createdAt: 'DESC' },
        });
    }

    findByLead(leadId: string) {
        return this.tasksRepository.find({
            where: { leadId },
            order: { dueDate: 'ASC' },
        });
    }

    findPending(companyId: string) {
        return this.tasksRepository.find({
            where: { companyId, status: TaskStatus.PENDING },
            order: { dueDate: 'ASC' },
        });
    }

    async update(id: string, dto: UpdateTaskDto) {
        const task = await this.tasksRepository.findOneBy({ id });
        if (!task) throw new NotFoundException('Task not found');
        Object.assign(task, dto);
        if (dto.status === TaskStatus.DONE) {
            task.completedAt = new Date();
        }
        return this.tasksRepository.save(task);
    }

    async remove(id: string) {
        const result = await this.tasksRepository.delete(id);
        if (!result.affected) throw new NotFoundException('Task not found');
    }
}
