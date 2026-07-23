import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email inválido');
    }

    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.newsletter.findUnique({
      where: { email: normalized }
    });

    if (existing) {
      return { success: true, message: 'Ya estás registrado' };
    }

    await this.prisma.newsletter.create({
      data: { email: normalized }
    });

    return { success: true, message: 'Registro completado con éxito' };
  }

  async findAllSubscribers() {
    return this.prisma.newsletter.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async unsubscribe(id: string) {
    return this.prisma.newsletter.delete({ where: { id } });
  }
}
