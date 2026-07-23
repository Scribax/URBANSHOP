import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post()
  async subscribe(@Body('email') email: string) {
    return this.newsletterService.subscribe(email);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.newsletterService.findAllSubscribers();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.newsletterService.unsubscribe(id);
  }
}
