import { Controller, Get, Post, Put, Body, Param, UseGuards, HttpCode, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- CLIENT ENDPOINTS ---

  @Post()
  async createOrder(@Body() body: any) {
    return this.ordersService.createOrder(body);
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {
    return this.ordersService.handleWebhook(body);
  }

  @Post('mock-pay/:id')
  async mockPay(@Param('id') id: string, @Body() body: { paymentId?: string }) {
    const paymentId = body.paymentId || `mock-pay-${Date.now()}`;
    return this.ordersService.markOrderAsPaid(id, paymentId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('user/history')
  async getMyOrders(@Req() req: any) {
    return this.ordersService.findUserOrderHistory(req.user.email);
  }

  // --- ADMIN ENDPOINTS ---

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin/all')
  async getAllOrders() {
    return this.ordersService.findAllOrdersAdmin();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('admin/:id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findOrderById(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('admin/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.ordersService.updateOrderStatus(id, body.status as any);
  }
}
