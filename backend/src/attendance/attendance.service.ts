import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async recordHeartbeat(userId: string, courseId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const record = await this.prisma.attendance.findUnique({
            where: {
                userId_courseId_date: {
                    userId,
                    courseId,
                    date: today,
                },
            },
        });

        if (record) {
            // Check if last ping was more than 45 seconds ago to prevent abuse
            const timeDiff = new Date().getTime() - new Date(record.lastPing).getTime();
            if (timeDiff < 45000) {
                // Too soon, just update lastPing but don't increment minutes
                return this.prisma.attendance.update({
                    where: { id: record.id },
                    data: { lastPing: new Date() },
                });
            }

            return this.prisma.attendance.update({
                where: { id: record.id },
                data: {
                    minutes: { increment: 1 },
                    lastPing: new Date(),
                },
            });
        } else {
            return this.prisma.attendance.create({
                data: {
                    userId,
                    courseId,
                    date: today,
                    minutes: 1,
                    lastPing: new Date(),
                },
            });
        }
    }

    async getStats(userId: string) {
        // Group by date to get total minutes per day
        const records = await this.prisma.attendance.groupBy({
            by: ['date'],
            where: { userId },
            _sum: { minutes: true },
            orderBy: { date: 'asc' },
        });

        // Format for heatmap: { date: 'YYYY-MM-DD', count: minutes }
        return records.map(r => ({
            date: r.date.toISOString().split('T')[0],
            count: r._sum.minutes || 0
        }));
    }
}
