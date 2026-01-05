import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chat')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post('conversation')
    createConversation(@Request() req: any, @Body() body: { targetUserId: string }) {
        return this.chatService.createConversation(req.user.id, body.targetUserId);
    }

    @Get('conversations')
    getConversations(@Request() req: any) {
        return this.chatService.getConversations(req.user.id);
    }

    @Post('messages')
    sendMessage(@Request() req: any, @Body() body: { conversationId: string; content: string }) {
        return this.chatService.sendMessage(req.user.id, body.conversationId, body.content);
    }

    @Get('messages/:conversationId')
    getMessages(@Request() req: any, @Param('conversationId') conversationId: string) {
        return this.chatService.getMessages(req.user.id, conversationId);
    }
}
