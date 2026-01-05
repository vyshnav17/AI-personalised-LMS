import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommunityService {
    private badWords = ['hell', 'damn', 'bitch', 'shit', 'fuck', 'ass', 'bastard', 'crap']; // Basic list

    constructor(private prisma: PrismaService) { }

    private clean(text: string): string {
        let cleanText = text;
        this.badWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            cleanText = cleanText.replace(regex, '*'.repeat(word.length));
        });
        return cleanText;
    }

    async createCommunity(userId: string, name: string, description: string) {
        try {
            return await this.prisma.community.create({
                data: {
                    name,
                    description,
                    creatorId: userId,
                    members: {
                        create: { userId }
                    }
                }
            });
        } catch (error) {
            throw new BadRequestException('Community name already exists or invalid data');
        }
    }

    async deleteCommunity(userId: string, communityId: string) {
        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
            select: { creatorId: true }
        });

        if (!community) {
            throw new NotFoundException('Community not found');
        }

        if (community.creatorId !== userId) {
            throw new BadRequestException('Only the creator can delete this community');
        }

        return this.prisma.community.delete({
            where: { id: communityId }
        });
    }

    async getCommunityMembers(communityId: string) {
        const community = await this.prisma.community.findUnique({
            where: { id: communityId },
            include: {
                members: {
                    include: {
                        user: {
                            select: { id: true, name: true, email: true, role: true }
                        }
                    }
                }
            }
        });
        if (!community) return [];
        return community.members.map(m => m.user);
    }

    async getCommunities(userId: string) {
        const communities = await this.prisma.community.findMany({
            include: {
                _count: { select: { members: true, posts: true } },
                members: { where: { userId }, select: { userId: true } }
            }
        });

        return communities.map(c => ({
            ...c,
            isJoined: c.members.length > 0,
            memberCount: c._count.members,
            postCount: c._count.posts
        }));
    }

    async joinCommunity(userId: string, communityId: string) {
        try {
            return await this.prisma.communityMember.create({
                data: { userId, communityId }
            });
        } catch (error) {
            return { message: 'Already joined' };
        }
    }

    async leaveCommunity(userId: string, communityId: string) {
        return this.prisma.communityMember.deleteMany({
            where: { userId, communityId }
        });
    }

    async createPost(userId: string, title: string, content: string, communityId?: string, courseId?: string) {
        if (!communityId && !courseId) throw new BadRequestException('Post must belong to a community or course');

        const cleanTitle = this.clean(title);
        const cleanContent = this.clean(content);

        return this.prisma.communityPost.create({
            data: { userId, title: cleanTitle, content: cleanContent, communityId, courseId },
            include: {
                user: { select: { id: true, name: true, role: true } },
                _count: { select: { comments: true, likes: true } },
                likes: { select: { userId: true } },
            },
        });
    }

    async getPosts(courseId?: string, communityId?: string) {
        return this.prisma.communityPost.findMany({
            where: {
                ...(courseId ? { courseId } : {}),
                ...(communityId ? { communityId } : {})
            },
            include: {
                user: { select: { id: true, name: true, role: true } },
                _count: { select: { comments: true, likes: true } },
                likes: { select: { userId: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPost(id: string) {
        const post = await this.prisma.communityPost.findUnique({
            where: { id },
            include: {
                user: { select: { id: true, name: true } },
                comments: {
                    include: { user: { select: { id: true, name: true } } },
                    orderBy: { createdAt: 'asc' },
                },
                likes: true,
                community: { select: { id: true, name: true } }
            },
        });
        if (!post) throw new NotFoundException('Post not found');
        return post;
    }

    async addComment(userId: string, postId: string, content: string) {
        const cleanContent = this.clean(content);
        return this.prisma.comment.create({
            data: { userId, postId, content: cleanContent },
            include: { user: { select: { id: true, name: true } } },
        });
    }

    async toggleLike(userId: string, postId: string) {
        const existing = await this.prisma.like.findUnique({
            where: { userId_postId: { userId, postId } },
        });

        if (existing) {
            await this.prisma.like.delete({ where: { id: existing.id } });
            return { liked: false };
        } else {
            await this.prisma.like.create({ data: { userId, postId } });
            return { liked: true };
        }
    }
}
