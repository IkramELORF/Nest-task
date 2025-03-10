import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFitlerDto } from './dto/get-tasks-filter.dto';
import { TasksRepository } from './tasks.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository,
  ) { }
  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<Task> {
    return this.tasksRepository.createTask(createTaskDto, user);
  }

  async getTaskById(
    id: number,
    user: User,
  ): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id, userId: user.id } });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  async getTasks(
    filterDto: GetTasksFitlerDto,
    user: User,
  ): Promise<Task[]> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async deleteTask(
    id: number,
    user: User,
  ): Promise<void> {
    const result = await this.tasksRepository.delete({id, userId: user.id});
    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: number, 
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
