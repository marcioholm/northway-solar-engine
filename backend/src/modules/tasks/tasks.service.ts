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
  ) {}

  create(companyId: string, userId: string, dto: CreateTaskDto) {
    const task = this.tasksRepository.create({
      ...dto,
      companyId,
      createdBy: userId,
      assignedTo: dto.assignedTo || userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
    return this.tasksRepository.save(task);
  }

  findAll(companyId: string, ownerUserId?: string) {
    if (ownerUserId) {
      return this.tasksRepository.find({
        where: [
          { companyId, assignedTo: ownerUserId },
          { companyId, createdBy: ownerUserId },
        ],
        order: { createdAt: 'DESC' },
      });
    }
    return this.tasksRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  findByLead(leadId: string, companyId: string, ownerUserId?: string) {
    if (ownerUserId) {
      return this.tasksRepository.find({
        where: [
          { leadId, companyId, assignedTo: ownerUserId },
          { leadId, companyId, createdBy: ownerUserId },
        ],
        order: { dueDate: 'ASC' },
      });
    }
    return this.tasksRepository.find({
      where: { leadId, companyId },
      order: { dueDate: 'ASC' },
    });
  }

  findPending(companyId: string, ownerUserId?: string) {
    if (ownerUserId) {
      return this.tasksRepository.find({
        where: [
          { companyId, status: TaskStatus.PENDING, assignedTo: ownerUserId },
          { companyId, status: TaskStatus.PENDING, createdBy: ownerUserId },
        ],
        order: { dueDate: 'ASC' },
      });
    }
    return this.tasksRepository.find({
      where: { companyId, status: TaskStatus.PENDING },
      order: { dueDate: 'ASC' },
    });
  }

  async update(id: string, companyId: string, dto: UpdateTaskDto, ownerUserId?: string) {
    const task = await this.tasksRepository.findOneBy({ id, companyId });
    if (!task) throw new NotFoundException('Task not found');
    if (ownerUserId && task.assignedTo !== ownerUserId && task.createdBy !== ownerUserId) {
      throw new NotFoundException('Task not found');
    }
    Object.assign(task, dto);
    if (dto.status === TaskStatus.DONE) {
      task.completedAt = new Date();
    }
    return this.tasksRepository.save(task);
  }

  async remove(id: string, companyId: string, ownerUserId?: string) {
    const task = await this.tasksRepository.findOneBy({ id, companyId });
    if (!task) throw new NotFoundException('Task not found');
    if (ownerUserId && task.assignedTo !== ownerUserId && task.createdBy !== ownerUserId) {
      throw new NotFoundException('Task not found');
    }
    await this.tasksRepository.remove(task);
  }
}
