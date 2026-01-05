import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ExamService {
    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    async generateExam(courseId: string) {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            include: { modules: { include: { lessons: true } } },
        });

        if (!course) throw new NotFoundException('Course not found');

        // Create prompt from course content
        const context = course.modules
            .map((m) => m.lessons.map((l) => `${l.title}: ${l.content}`).join('\n'))
            .join('\n');

        const questions = await this.aiService.generateExamQuestions(context);

        // Save Logic (Mock for now, normally we'd save "load" to DB)
        // For MVP, we'll return the questions directly. 
        // In a real app, we'd save Exam -> Questions in DB.

        return { courseId, questions };
    }

    async submitExam(userId: string, courseId: string, answers: Record<string, string>, questions: any[]) {
        let score = 0;

        // Calculate score
        questions.forEach((q, idx) => {
            if (answers[idx] === q.correctAnswer) {
                score++;
            }
        });

        // Save result
        const result = await this.prisma.examResult.create({
            data: {
                userId,
                courseId,
                score,
                details: JSON.stringify({ questions, answers }),
            },
        });

        return { score, total: questions.length, resultId: result.id };
    }

    async getExam(id: string) {
        // Placeholder: Retrieve stored exam
        return { id, message: 'Exam retrieval implementation pending persistence' };
    }
}
