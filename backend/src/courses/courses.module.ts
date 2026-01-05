import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { AiModule } from '../ai/ai.module';
import { AuthModule } from '../auth/auth.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [AiModule, AuthModule, GamificationModule],
  controllers: [CoursesController],
  providers: [CoursesService],
})
export class CoursesModule { }
