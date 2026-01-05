import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { CertificateService } from './certificate.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('certificates')
@UseGuards(AuthGuard('jwt'))
export class CertificateController {
    constructor(private readonly certificateService: CertificateService) { }

    @Post('generate')
    async generate(@Body() body: { courseId: string; userId: string; userName: string; courseTitle: string }, @Res() res: Response) {
        const buffer = await this.certificateService.generateCertificate(body.userName, body.courseTitle);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=certificate.pdf`,
            'Content-Length': buffer.length.toString(),
        });

        res.end(buffer);
    }
}
