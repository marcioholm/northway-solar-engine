import { Allow } from 'class-validator';
import { TaskType, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
  @Allow()
  leadId?: string;
  @Allow()
  title: string;
  @Allow()
  description?: string;
  @Allow()
  type?: TaskType;
  @Allow()
  priority?: TaskPriority;
  @Allow()
  assignedTo?: string;
  @Allow()
  dueDate?: string;
}
