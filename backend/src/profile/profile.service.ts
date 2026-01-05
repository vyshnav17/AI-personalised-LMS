import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { profile: true },
        });

        if (!user) return null;

        let profile = user.profile;
        if (!profile) {
            profile = await this.prisma.learningProfile.create({
                data: { userId },
            });
        }

        const { password, profile: _, ...userDetails } = user;
        const { id: profileId, userId: pid, ...profileData } = profile;

        return {
            ...userDetails,
            ...profileData,
        };
    }

    async updateProfile(userId: string, data: { difficulty?: string; pacing?: string; interests?: string[] }) {
        return this.prisma.learningProfile.upsert({
            where: { userId },
            create: {
                userId,
                difficulty: data.difficulty,
                pacing: data.pacing,
                interests: data.interests ? JSON.stringify(data.interests) : undefined,
            },
            update: {
                difficulty: data.difficulty,
                pacing: data.pacing,
                interests: data.interests ? JSON.stringify(data.interests) : undefined,
            },
        });
    }
}
