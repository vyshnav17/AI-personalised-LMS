import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GamificationService {
    constructor(private prisma: PrismaService) { }

    async getStats(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { achievements: { include: { achievement: true } } },
        });
        return {
            xp: user?.xp || 0,
            achievements: user?.achievements.map(ua => ua.achievement) || [],
        };
    }

    async getLeaderboard() {
        // Return top 10 users by XP
        return this.prisma.user.findMany({
            orderBy: { xp: 'desc' },
            take: 10,
            select: { id: true, name: true, email: true, xp: true, role: true },
        });
    }

    async awardXp(userId: string, amount: number) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { xp: { increment: amount } },
        });
    }

    async checkAchievements(userId: string) {
        // Simple example: Check if user has completed first course
        // In a real app, this would be more complex event-bus driven
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { enrollments: true, achievements: true },
        });

        // Placeholder implementation
        return [];
    }
}
