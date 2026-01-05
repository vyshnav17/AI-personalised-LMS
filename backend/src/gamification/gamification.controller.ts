import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) { }

    @Get('stats')
    @UseGuards(AuthGuard('jwt'))
    getMyStats(@Request() req: any) {
        return this.gamificationService.getStats(req.user.id);
    }

    @Get('leaderboard')
    getLeaderboard() {
        return this.gamificationService.getLeaderboard();
    }
}
