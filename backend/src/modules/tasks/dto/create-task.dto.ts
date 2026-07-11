import { TaskType, TaskPriority } from '../entities/task.entity';

export class CreateTaskDto {
    leadId?: string;
    title: string;
    description?: string;
    type?: TaskType;
    priority?: TaskPriority;
    assignedTo?: string;
    dueDate?: string;
}
