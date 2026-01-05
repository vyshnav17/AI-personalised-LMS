import { Module } from '@nestjs/common';
import { ExamService } from './exam.service';
import { ExamController } from './exam.controller';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [AiModule, PrismaModule],
    controllers: [ExamController],
    providers: [ExamService],
})
export class ExamModule { }
