import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
    private gamificationService: GamificationService,
  ) { }

  async generateCourse(prompt: string, userId: string) {
    this.logger.log(`Generating course for user ${userId} with prompt: ${prompt}`);

    // 1. Create Placeholder Course immediately
    let course;
    try {
      this.logger.log('Creating placeholder course...');
      course = await this.prisma.course.create({
        data: {
          title: 'Generating Course...',
          description: 'Your custom curriculum is being designed by AI. Please wait.',
          generatedBy: prompt,
          status: 'CREATING',
        },
        include: {
          modules: {
            include: { lessons: true },
          },
        },
      });
      this.logger.log(`Placeholder course created: ${course.id}`);

      // Create Enrollment for the creator
      this.logger.log(`Creating enrollment for user ${userId}...`);
      await this.prisma.enrollment.create({
        data: {
          userId,
          courseId: course.id,
          progress: 0,
        },
      });

      // Award XP
      this.logger.log(`Awarding XP to user ${userId}...`);
      await this.gamificationService.awardXp(userId, 50);
    } catch (error) {
      this.logger.error('Error during synchronous course generation steps:', error);
      throw error;
    }

    // 2. Trigger Async Generation (Fire and Forget)
    this.generateCurriculumAsync(course.id, prompt, userId).catch(err =>
      this.logger.error(`Async generation failed for course ${course.id}`, err)
    );

    return course;
  }

  private async generateCurriculumAsync(courseId: string, prompt: string, userId: string) {
    try {
      this.logger.log(`Starting async generation for course ${courseId}`);
      const curriculum = await this.aiService.generateCurriculum(prompt, userId);

      // Update Course with Details
      await this.prisma.course.update({
        where: { id: courseId },
        data: {
          title: curriculum.title || 'Untitled Course',
          description: curriculum.description || 'No description',
          status: 'READY',
          modules: {
            create: curriculum.modules?.map((mod: any, index: number) => ({
              title: mod.title,
              order: index + 1,
              lessons: {
                create: mod.lessons?.map((les: any, lIndex: number) => ({
                  title: les.title,
                  content: les.content || '',
                  order: lIndex + 1,
                })),
              },
            })),
          },
        },
      });
      this.logger.log(`Async generation completed for course ${courseId}`);
    } catch (error) {
      this.logger.error(`Failed to generate curriculum for course ${courseId}`, error);
      await this.prisma.course.update({
        where: { id: courseId },
        data: { status: 'FAILED', description: 'Failed to generate content. Please try again.' },
      });
    }
  }

  async generateLessonContent(courseId: string, lessonId: string, userId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Generate detailed content
    const detailedContent = await this.aiService.generateLessonDetails(
      lesson.title,
      lesson.module.course.title,
      userId,
    );

    // Update DB
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: { content: detailedContent },
    });
  }

  async findAll(userId: string) {
    return this.prisma.course.findMany({
      where: {
        enrollments: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
