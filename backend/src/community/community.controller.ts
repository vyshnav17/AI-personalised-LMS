import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { CommunityService } from './community.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('community')
@UseGuards(AuthGuard('jwt'))
export class CommunityController {
    constructor(private readonly communityService: CommunityService) { }

    // --- Communities ---
    @Post()
    createCommunity(@Request() req: any, @Body() body: { name: string; description: string }) {
        return this.communityService.createCommunity(req.user.id, body.name, body.description);
    }

    @Get()
    getCommunities(@Request() req: any) {
        return this.communityService.getCommunities(req.user.id);
    }

    @Post(':id/join')
    joinCommunity(@Request() req: any, @Param('id') communityId: string) {
        return this.communityService.joinCommunity(req.user.id, communityId);
    }

    @Delete(':id')
    deleteCommunity(@Request() req: any, @Param('id') communityId: string) {
        return this.communityService.deleteCommunity(req.user.id, communityId);
    }

    @Get(':id/members')
    getCommunityMembers(@Param('id') communityId: string) {
        return this.communityService.getCommunityMembers(communityId);
    }

    @Delete(':id/leave')
    leaveCommunity(@Request() req: any, @Param('id') communityId: string) {
        return this.communityService.leaveCommunity(req.user.id, communityId);
    }

    // --- Posts ---
    @Post('posts')
    createPost(@Request() req: any, @Body() body: { title: string; content: string; communityId?: string; courseId?: string }) {
        return this.communityService.createPost(req.user.id, body.title, body.content, body.communityId, body.courseId);
    }

    @Get('posts')
    getPosts(@Query('courseId') courseId?: string, @Query('communityId') communityId?: string) {
        return this.communityService.getPosts(courseId, communityId);
    }

    @Get('posts/:id')
    getPost(@Param('id') id: string) {
        return this.communityService.getPost(id);
    }

    @Post('posts/:id/comments')
    addComment(@Request() req: any, @Param('id') postId: string, @Body() body: { content: string }) {
        return this.communityService.addComment(req.user.id, postId, body.content);
    }

    @Post('posts/:id/like')
    toggleLike(@Request() req: any, @Param('id') postId: string) {
        return this.communityService.toggleLike(req.user.id, postId);
    }
}
