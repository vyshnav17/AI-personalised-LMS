import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
// @ts-ignore
import { redisStore } from 'cache-manager-redis-yet';
import { AiModule } from './ai/ai.module';
import { CoursesModule } from './courses/courses.module';
import { TutorModule } from './tutor/tutor.module';
import { ExamModule } from './exam/exam.module';
import { CertificateModule } from './certificate/certificate.module';
import { AttendanceModule } from './attendance/attendance.module';
import { CommunityModule } from './community/community.module';
import { ProfileModule } from './profile/profile.module';
import { GamificationModule } from './gamification/gamification.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        url: config.get('REDIS_URL') || 'redis://localhost:6379',
        ttl: 5000,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    AiModule,
    CoursesModule,
    TutorModule,
    ExamModule,
    CertificateModule,
    CertificateModule,
    AttendanceModule,
    CommunityModule,
    ProfileModule,
    GamificationModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
