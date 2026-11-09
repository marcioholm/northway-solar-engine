import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { scopeFor } from '../../common/utils/scope.util';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateTaskDto) {
    const scope = scopeFor(req.user);
    return this.tasksService.create(scope.companyId, req.user.userId, dto);
  }

  @Get()
  findAll(@Request() req, @Query('leadId') leadId?: string) {
    const scope = scopeFor(req.user);
    if (leadId) {
      return this.tasksService.findByLead(leadId, scope.companyId, scope.ownerUserId);
    }
    return this.tasksService.findAll(scope.companyId, scope.ownerUserId);
  }

  @Get('pending')
  findPending(@Request() req) {
    const scope = scopeFor(req.user);
    return this.tasksService.findPending(scope.companyId, scope.ownerUserId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req) {
    const scope = scopeFor(req.user);
    return this.tasksService.update(id, scope.companyId, dto, scope.ownerUserId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const scope = scopeFor(req.user);
    return this.tasksService.remove(id, scope.companyId, scope.ownerUserId);
  }
}
