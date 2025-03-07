import { TaskStatus } from "../task.model";
import { IsOptional, IsNotEmpty, IsIn } from 'class-validator';

export class GetTasksFitlerDto{
    @IsOptional()
    @IsIn([TaskStatus.OPEN, TaskStatus.IN_PROGRESS, TaskStatus.DONE])
    status: TaskStatus;
    
    @IsOptional()
    @IsNotEmpty()
    search: string;

}