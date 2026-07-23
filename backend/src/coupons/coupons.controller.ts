import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('validate/:code')
  async validate(@Param('code') code: string) {
    return this.couponsService.validateCoupon(code);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin/all')
  async getAllAdmin() {
    return this.couponsService.findAllCoupons();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post()
  async create(@Body() body: any) {
    return this.couponsService.createCoupon(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.couponsService.updateCoupon(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.couponsService.deleteCoupon(id);
  }
}
