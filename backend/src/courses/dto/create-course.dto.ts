import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class CreateCourseDto {
    @ApiProperty({ example: 'I want to learn Machine Learning from scratch' })
    @IsNotEmpty()
    @MinLength(5)
    prompt: string;
}
