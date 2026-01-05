import { Controller, Get, Post, Body, UseGuards, Request, Put } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
    constructor(private readonly profileService: ProfileService) { }

    @Get()
    getProfile(@Request() req: any) {
        return this.profileService.getProfile(req.user.id);
    }

    @Put()
    updateProfile(@Request() req: any, @Body() body: { difficulty?: string; pacing?: string; interests?: string[] }) {
        return this.profileService.updateProfile(req.user.id, body);
    }
}
