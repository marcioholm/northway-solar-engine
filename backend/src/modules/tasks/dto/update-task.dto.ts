import { Allow } from 'class-validator';
import { TaskType, TaskPriority, TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  @Allow()
  title?: string;
  @Allow()
  description?: string;
  @Allow()
  type?: TaskType;
  @Allow()
  priority?: TaskPriority;
  @Allow()
  status?: TaskStatus;
  @Allow()
  assignedTo?: string;
  @Allow()
  dueDate?: string;
}
