import { Injectable } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

@Injectable()
export class TutorService {
    constructor(private aiService: AiService) { }

    async chat(message: string, context: string, userId: string) {
        return this.aiService.chatWithContext(message, context, userId);
    }
}
