import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
    constructor(private prisma: PrismaService) { }

    async createConversation(userId: string, targetUserId: string) {
        // Check if conversation already exists
        const existing = await this.prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: targetUserId } } },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, picture: true }
                        }
                    }
                }
            }
        });

        if (existing) return existing;

        // Create new conversation
        return this.prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId },
                        { userId: targetUserId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, picture: true }
                        }
                    }
                }
            }
        });
    }

    async getConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: {
                participants: { some: { userId } }
            },
            include: {
                participants: {
                    include: { user: { select: { id: true, name: true, picture: true } } }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    async sendMessage(userId: string, conversationId: string, content: string) {
        return this.prisma.directMessage.create({
            data: {
                content,
                senderId: userId,
                conversationId
            }
        });
    }

    async getMessages(userId: string, conversationId: string) {
        // Verify participation
        const participation = await this.prisma.conversationParticipant.findUnique({
            where: { userId_conversationId: { userId, conversationId } }
        });
        if (!participation) throw new ForbiddenException('Not a participant');

        return this.prisma.directMessage.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' }
        });
    }
}
