import { TaskType, TaskPriority, TaskStatus } from '../entities/task.entity';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedTo?: string;
  dueDate?: string;
}
