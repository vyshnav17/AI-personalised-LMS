import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

@Injectable()
export class CertificateService {
    async generateCertificate(userName: string, courseTitle: string): Promise<Buffer> {
        return new Promise((resolve) => {
            const doc = new PDFDocument({
                layout: 'landscape',
                size: 'A4',
                margin: 50
            });

            const buffers: Buffer[] = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });

            // --- Design ---
            const width = doc.page.width;
            const height = doc.page.height;

            // Background & Border
            doc.rect(0, 0, width, height).fill('#ffffff');

            // Outer Border
            doc.lineWidth(3).strokeColor('#4f46e5'); // Indigo 600
            doc.rect(20, 20, width - 40, height - 40).stroke();

            // Inner Border (Double line effect)
            doc.lineWidth(1).strokeColor('#e0e7ff'); // Indigo 100
            doc.rect(30, 30, width - 60, height - 60).stroke();

            // Header logos (optional placeholder)
            // doc.image('path/to/logo.png', width / 2 - 25, 60, { width: 50 });

            doc.moveDown(3);

            // Title
            doc.font('Helvetica-Bold').fontSize(36).fillColor('#111827').text('CERTIFICATE OF ACHIEVEMENT', { align: 'center', characterSpacing: 2 });

            doc.moveDown(0.5);
            doc.lineWidth(2).moveTo(width / 2 - 100, doc.y).lineTo(width / 2 + 100, doc.y).strokeColor('#4f46e5').stroke();

            doc.moveDown(2);

            // "Presented to"
            doc.font('Helvetica').fontSize(14).fillColor('#6b7280').text('This certificate is proudly presented to', { align: 'center' });

            doc.moveDown(1.5);

            // Recipient Name
            doc.font('Helvetica-BoldOblique').fontSize(40).fillColor('#1e1b4b').text(userName, { align: 'center' });

            doc.moveDown(1.5);

            // "For completing"
            doc.font('Helvetica').fontSize(14).fillColor('#6b7280').text('for successfully completing the course', { align: 'center' });

            doc.moveDown(1);

            // Course Title
            doc.font('Helvetica-Bold').fontSize(28).fillColor('#1f2937').text(courseTitle, { align: 'center' });

            doc.moveDown(4);

            // Footer Section (Date & Signature)
            const signatureY = doc.y;

            // Date
            doc.text('', 100, signatureY); // Move cursor
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#374151').text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), { align: 'left' });
            doc.lineWidth(1).moveTo(100, signatureY + 20).lineTo(250, signatureY + 20).strokeColor('#9ca3af').stroke();
            doc.fontSize(10).font('Helvetica').fillColor('#9ca3af').text('Date', 100, signatureY + 25, { align: 'left' });

            // Signature Line
            doc.text('', width - 250, signatureY); // Move cursor
            doc.lineWidth(1).moveTo(width - 250, signatureY + 20).lineTo(width - 100, signatureY + 20).strokeColor('#9ca3af').stroke();
            doc.fontSize(12).font('Helvetica-BoldOblique').fillColor('#1f2937').text('AI Tutor', width - 250, signatureY - 15, { align: 'left' }); // Mock Signature
            doc.fontSize(10).font('Helvetica').fillColor('#9ca3af').text('Instructor Signature', width - 250, signatureY + 25, { align: 'left' });

            // ID / Metadata footer
            const id = `ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            doc.fontSize(8).fillColor('#d1d5db').text(id, 20, height - 20, { align: 'center' });

            doc.end();
        });
    }
}
