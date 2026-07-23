import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from './auth/admin.guard';

@Controller('config')
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':key')
  async getConfig(@Param('key') key: string) {
    const config = await this.prisma.siteConfig.findUnique({
      where: { key },
    });
    
    // Default fallback values for the homepage
    if (!config) {
      if (key === 'homepage') {
        return {
          heroTitle: "NO ES ROPA. ES IDENTIDAD.",
          heroSub: "Nacido en la calle. Vestí tu identidad. La cultura primero, la moda después.",
          marqueeTexts: [
            "NO SEGUIMOS TENDENCIAS. LAS CREAMOS.",
            "LATIN BROÚ 2026",
            "VESTÍ TU IDENTIDAD",
            "CADA DROP CUENTA UNA HISTORIA"
          ]
        };
      }
      return {};
    }
    return config.value;
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post(':key')
  async updateConfig(@Param('key') key: string, @Body() body: any) {
    const config = await this.prisma.siteConfig.upsert({
      where: { key },
      update: { value: body },
      create: { key, value: body },
    });
    return config.value;
  }
}
