import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './task.model';
import { createTaskDto } from './dto/create-task.dto';
import { GetTasksFitlerDto } from './dto/get-tasks-filter.dto';
import { filter } from 'rxjs';
import { TaskStatusValidationPipe } from './pipes/task-status-validation.pipe';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService){}

    @Get()
    getTasks(@Query(ValidationPipe) filterDto: GetTasksFitlerDto): Task[]{       
        if(Object.keys(filterDto).length){
            return this.tasksService.getTasksWithFilters(filterDto);
        } else
        {
            return this.tasksService.getAllTasks();

        }
    }

    @Get('/:id')
    getTasksById(@Param('id') id: string):Task{ 
        return this.tasksService.getTasksById(id);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createTask(@Body() createTaskDto: createTaskDto): Task {
        return this.tasksService.createTask(createTaskDto);
    }

    @Delete('/:id')
    deleteTask(@Param('id') id: string):void{ 
        return this.tasksService.deleteTask(id);
    }

    @Patch('/:id/status')
    updateTaskStatus( 
    @Param('id') id: string,
    @Body('status', TaskStatusValidationPipe) status: TaskStatus,
    ):Task{ 
        return this.tasksService.updateTaskStatus(id, status);
    }
}
 