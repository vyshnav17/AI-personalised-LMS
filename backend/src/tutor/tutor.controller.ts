import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { TutorService } from './tutor.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { IsNotEmpty } from 'class-validator';

class ChatDto {
    @IsNotEmpty()
    message: string;

    @IsNotEmpty()
    context: string; // Client sends lesson content as context for now (MVP)
}

@ApiTags('Tutor')
@Controller('tutor')
export class TutorController {
    constructor(private readonly tutorService: TutorService) { }

    @Post('chat')
    @UseGuards(AuthGuard('jwt'))
    chat(@Request() req: any, @Body() dto: ChatDto) {
        return this.tutorService.chat(dto.message, dto.context, req.user.id);
    }
}
