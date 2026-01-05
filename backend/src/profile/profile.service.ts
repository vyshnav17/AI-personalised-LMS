import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) { }

    async getProfile(userId: string) {
        let profile = await this.prisma.learningProfile.findUnique({ where: { userId } });
        if (!profile) {
            // Create default
            profile = await this.prisma.learningProfile.create({
                data: { userId },
            });
        }
        return profile;
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
