import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    try {
      console.log('Attempting to register user:', dto.email);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          name: dto.name,
        },
      });
      return this.signToken(user.id, user.email, user.role, user.name || 'User');
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    return this.signToken(user.id, user.email, user.role, user.name || 'User');
  }

  async signToken(userId: string, email: string, role: string, name: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: userId,
        email,
        name,
        role
      }
    };
  }
}
