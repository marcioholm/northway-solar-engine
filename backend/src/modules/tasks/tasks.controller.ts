import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(req.user.companyId, req.user.userId, dto);
    }

    @Get()
    findAll(@Request() req, @Query('leadId') leadId?: string) {
        if (leadId) {
            return this.tasksService.findByLead(leadId);
        }
        return this.tasksService.findAll(req.user.companyId);
    }

    @Get('pending')
    findPending(@Request() req) {
        return this.tasksService.findPending(req.user.companyId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
        return this.tasksService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tasksService.remove(id);
    }
}
