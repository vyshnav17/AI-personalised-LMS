import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('heartbeat')
    heartbeat(@Request() req: any, @Body() body: { courseId: string }) {
        return this.attendanceService.recordHeartbeat(req.user.id, body.courseId);
    }

    @Get('stats')
    getStats(@Request() req: any) {
        return this.attendanceService.getStats(req.user.id);
    }
}
