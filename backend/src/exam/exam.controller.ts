import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNotEmpty, IsString } from 'class-validator';

class CreateExamDto {
    @IsNotEmpty()
    @IsString()
    courseId: string;
}

class SubmitExamDto {
    @IsNotEmpty()
    courseId: string;

    @IsNotEmpty()
    questions: any[];

    @IsNotEmpty()
    answers: Record<string, string>; // index -> answer
}

@ApiTags('Exams')
@Controller('exams')
@UseGuards(AuthGuard('jwt'))
export class ExamController {
    constructor(private readonly examService: ExamService) { }

    @Post('generate')
    generate(@Body() dto: CreateExamDto) {
        return this.examService.generateExam(dto.courseId);
    }

    @Post('submit')
    submit(@Body() dto: SubmitExamDto, @Request() req: any) {
        return this.examService.submitExam(req.user.id, dto.courseId, dto.answers, dto.questions);
    }

    @Get(':id')
    getExam(@Param('id') id: string) {
        return this.examService.getExam(id);
    }
}
