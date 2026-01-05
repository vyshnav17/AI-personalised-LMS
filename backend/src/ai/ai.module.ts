import { Module } from '@nestjs/common';
import { AiService } from './ai.service';

@Module({
  providers: [AiService],
  exports: [AiService], // Export so CoursesModule can use it
})
export class AiModule { }
