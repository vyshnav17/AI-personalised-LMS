import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) { }

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  generate(@Request() req: any, @Body() createCourseDto: CreateCourseDto) {
    // req.user is populated by JwtStrategy
    return this.coursesService.generateCourse(createCourseDto.prompt, req.user.id);
  }

  @Post(':courseId/lessons/:lessonId/generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  generateLesson(@Request() req: any, @Param('courseId') courseId: string, @Param('lessonId') lessonId: string) {
    return this.coursesService.generateLessonContent(courseId, lessonId, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  findAll(@Request() req: any) {
    return this.coursesService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.coursesService.delete(id);
  }
}
