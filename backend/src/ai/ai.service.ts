import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private groq: Groq;
  private model: string;
  private readonly logger = new Logger(AiService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.model = this.configService.get<string>('GROQ_MODEL') || 'llama3-70b-8192';

    this.logger.log(`Initializing Groq Service with model ${this.model}`);

    this.groq = new Groq({ apiKey });
  }

  async generateCurriculum(prompt: string, userId?: string) {
    let systemPrompt = `
      You are an expert curriculum designer. 
      Create a structured learning path for the user's request.
      IMPORTANT:
      - Return ONLY valid JSON.
      - Do not use Markdown code blocks.
      - Create a curriculum with 2-3 modules.
      - Each module MUST have 2-3 lessons.
      - Keep lesson content brief (approx 100 words).
      Structure:
      {
        "title": "Course Title",
        "description": "Brief description",
        "modules": [
          {
            "title": "Module Title",
            "lessons": [
              { "title": "Lesson Title", "content": "Concise content..." }
            ]
          }
        ]
      }
      User Request: ${prompt}
    `;

    if (userId) {
      const profile = await this.prisma.learningProfile.findUnique({ where: { userId } });
      if (profile) {
        systemPrompt += `
        ADAPT TO LEARNER PROFILE:
        - Difficulty: ${profile.difficulty} (Adjust depth/complexity accordingly. If ADVANCED, use technical terms. If BEGINNER, be simple.)
        - Pacing: ${profile.pacing}
        - Interests: ${profile.interests}
        `;
      }
    }

    try {
      this.logger.log(`Generating curriculum with model: ${this.model}`);
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: this.model,
        response_format: { type: 'json_object' },
      });

      let content = response.choices[0]?.message?.content || '{}';
      this.logger.debug(`Raw Groq Response: ${content.substring(0, 500)}...`);

      // Robust JSON extraction
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        content = jsonMatch[0];
      } else {
        // Fallback cleanup if no braces found (unlikely but safe)
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      this.logger.debug(`Cleaned Content Length: ${content.length}`);
      try {
        return JSON.parse(content);
      } catch (parseError) {
        this.logger.error('JSON Parse Failed. Cleaned Content:', content);
        throw parseError;
      }
    } catch (error) {
      this.logger.error('Error generating curriculum details:', error);
      throw error;
    }
  }

  async generateLessonDetails(lessonTitle: string, courseTitle: string, userId?: string) {
    let systemPrompt = `
      You are an expert tutor.
      Topic: ${lessonTitle}
      Course: ${courseTitle}
      
      Provide a detailed, comprehensive explanation of this lesson topic.
      Structure:
      1. **Introduction**: Briefly introduce the topic and why it matters.
      2. **Core Concepts**: Explain the main ideas in depth (3-4 paragraphs).
      3. **Real-World Example**: A concrete scenario or code snippet demonstrating the concept.
      4. **Practice**: A small exercise or thought experiment for the student.
      5. **Summary**: Key takeaways.

      - CRITICAL: The content MUST be extensive and deep (MINIMUM 1000 words).
      - Do NOT summarize. Explain every concept in extreme detail.
    `;

    if (userId) {
      const profile = await this.prisma.learningProfile.findUnique({ where: { userId } });
      if (profile) {
        systemPrompt += `
        ADAPTATION:
        - The user is ${profile.difficulty} level. 
        - If ADVANCED: Skip basics, focus on nuances, edge cases, and performance.
        - If BEGINNER: Use analogies, define jargon, be encouraging.
        `;
      }
    }

    systemPrompt += `
      Return ONLY the Markdown content string. Do not wrap in JSON.
    `;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: this.model,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('Error generating lesson details', error);
      throw error;
    }
  }

  async chatWithContext(message: string, context: string, userId?: string) {
    let systemPrompt = `
      You are Antigravity, an intelligent AI Guide and Tutor for this Learning Management System.
      
      YOUR ROLE:
      1. Act as a helpful guide for the website.
      2. Explain features like Courses, Community, Exams, Leaderboards, and Settings.
      3. If the user asks about the specific lesson content provided below, answer as a Tutor.
      4. If the user asks about the website/platform, act as a Guide.

      PLATFORM KNOWLEDGE:
      - **Dashboard**: View streaks, progress, and quick stats.
      - **My Courses**: Manage and resume enrolled AI-generated courses.
      - **Community**: Join interest groups, discuss topics, and find members.
      - **Leaderboard**: Compete with others based on XP.
      - **Settings**: Manage profile and account preferences.

      CONTEXT (Lesson/Page Content):
      ${context}

      INSTRUCTIONS:
      - Be concise, friendly, and encouraging.
      - If the user is lost, suggest where to go.
      - Use the context effectively to answer subject-matter questions.
    `;

    if (userId) {
      const profile = await this.prisma.learningProfile.findUnique({ where: { userId } });
      if (profile) {
        systemPrompt += `
        ADAPTATION:
        - User Level: ${profile.difficulty}
        - User Interests: ${profile.interests}
        - Adjust your language and examples to match their level and interests.
        `;
      }
    }

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        model: this.model,
      });

      return { response: response.choices[0]?.message?.content || '' };
    } catch (error) {
      this.logger.error('Error in chat', error);
      throw error;
    }
  }

  async generateExamQuestions(context: string) {
    const systemPrompt = `
      You are a strict examiner.
      Create a 5-question multiple choice exam based on the provided context.
      Return ONLY valid JSON format:
      {
        "questions": [
          {
            "question": "Question text",
            "options": ["Option 1 text", "Option 2 text", "Option 3 text", "Option 4 text"],
            "correctAnswer": "Option 1 text"
          }
        ]
      }
      IMPORTANT: "correctAnswer" MUST be the exact string from the "options" array. Do not use labels like A, B, C, D.
      Context: ${context.substring(0, 10000)}...
    `;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }],
        model: this.model,
        response_format: { type: 'json_object' },
      });

      let content = response.choices[0]?.message?.content || '{}';
      // Even with format: json, sometimes it wraps
      content = content.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

      const parsed = JSON.parse(content);
      return parsed.questions || [];
    } catch (error) {
      this.logger.error('Error generating exam', error);
      return [];
    }
  }
}
