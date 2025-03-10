import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { GetTasksFitlerDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksRepository extends Repository<Task> {
  private logger = new Logger(`TasksRepository`);
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasks(filterDto: GetTasksFitlerDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;
    const query = this.createQueryBuilder('task');
    query.where('task.userId = :userId', { userId: user.id });
    if(status){
      query.andWhere('task.status= :status',{status});
    }
    if(search){
      query.andWhere('("task"."title" LIKE :search OR "task"."description" LIKE :search)', { search:`%${search}%` });
    }
    try{
      const tasks = query.getMany();
      return tasks;
    } catch (error){
      this.logger.error(`Failed to get tasks for user ${user.username}". Filters: ${JSON.stringify(filterDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }

  async createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    try{
      await this.save(task);
      return task;
    } catch(error){
      this.logger.error(`Failed to create new task for user ${user.username}". Data: ${JSON.stringify(createTaskDto)}`, error.stack);
      throw new InternalServerErrorException();
    }
  }
}
