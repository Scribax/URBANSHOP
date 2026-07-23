import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MercadoPagoConfig, Preference } from 'mercadopago';

@Injectable()
export class OrdersService {
  private mpClient: MercadoPagoConfig | null = null;

  constructor(private prisma: PrismaService) {
    const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (token && token !== 'MP_TEST_ACCESS_TOKEN') {
      try {
        this.mpClient = new MercadoPagoConfig({ accessToken: token });
      } catch (err) {
        console.error('Failed to initialize MercadoPago:', err);
      }
    }
  }

  // --- CREATE ORDER ---
  async createOrder(data: {
    customerDetails: { name: string; email: string };
    shippingAddress: { address: string; city: string; zip: string; phone: string };
    items: Array<{ productId: string; quantity: number; size: string; color: string }>;
    couponCode?: string;
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    // Wrap in Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      let orderTotal = 0;
      const orderItemsToCreate = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product "${product.name}". Available: ${product.stock}`);
        }

        // Reduce stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        const itemTotal = product.price * item.quantity;
        orderTotal += itemTotal;

        orderItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          size: item.size,
          color: item.color,
        });
      }

      // Apply coupon discount if provided
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() }
        });

        if (coupon && coupon.isActive && (!coupon.expiryDate || new Date() < coupon.expiryDate)) {
          const discount = coupon.discountType === 'PERCENTAGE'
            ? (orderTotal * coupon.value) / 100
            : coupon.value;
          orderTotal = Math.max(0, orderTotal - discount);
        }
      }

      // Generate order number: e.g. LB-2026-XXXX
      const count = await tx.order.count();
      const orderNumber = `LB-2026-${String(count + 1).padStart(4, '0')}`;

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          total: orderTotal,
          customerDetails: data.customerDetails as any,
          shippingAddress: data.shippingAddress as any,
          items: {
            create: orderItemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Generate MercadoPago Preference
      let checkoutUrl = '';
      if (this.mpClient) {
        try {
          const preference = new Preference(this.mpClient);
          
          // If discount coupon was applied, send single adjusted summary item to avoid validation schema errors
          const mpItems = data.couponCode ? [
            {
              id: order.id,
              title: `Compra LATIN BROÚ (Cupón: ${data.couponCode.toUpperCase()})`,
              quantity: 1,
              unit_price: order.total,
            }
          ] : order.items.map((item) => ({
            id: item.productId,
            title: `${item.product.name} - ${item.size} / ${item.color}`,
            quantity: item.quantity,
            unit_price: item.price,
          }));

          const response = await preference.create({
            body: {
              items: mpItems,
              back_urls: {
                success: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/success?orderId=${order.id}`,
                failure: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/failure?orderId=${order.id}`,
                pending: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/pending?orderId=${order.id}`,
              },
              auto_return: 'approved',
              notification_url: `${process.env.BACKEND_URL || 'http://localhost:4000'}/orders/webhook`,
              external_reference: order.id,
            },
          });
          checkoutUrl = response.init_point || '';
        } catch (mpError) {
          console.error('MercadoPago preference creation error:', mpError);
        }
      }

      // Fallback checkout URL for local testing/mocking (pointing to port 3001)
      if (!checkoutUrl) {
        checkoutUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout/mock-payment?orderId=${order.id}`;
      }

      return { order, checkoutUrl };
    });
  }

  // --- WEBHOOK (MERCADOPAGO CALLBACK) ---
  async handleWebhook(body: any) {
    console.log('MercadoPago Webhook received:', JSON.stringify(body));

    // Handle payment status update
    // MercadoPago webhooks send notification triggers: body.action = 'payment.created', body.data.id = paymentId
    if (body.type === 'payment' || body.action === 'payment.created' || body.data?.id) {
      const paymentId = body.data?.id || body.id;
      
      // Usually, we would fetch payment details from MercadoPago:
      // const payment = new Payment(this.mpClient);
      // const paymentDetails = await payment.get({ id: paymentId });
      // For local mocks or simplified integration, we will simulate or support updating status:
      
      console.log(`Processing payment ID: ${paymentId}`);
      // Simple mock: if payment is received, mark related order as PAID
      // We will look for an order with this paymentId, or fetch it.
      // Since it's a webhook, we can update order status
      // We can also fetch the order based on external_reference if we read from MP.
    }
    return { received: true };
  }

  async markOrderAsPaid(id: string, paymentId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.order.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentId,
        paymentStatus: 'approved',
      },
    });
  }

  // --- ADMIN METHODS ---
  async findAllOrdersAdmin() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOrderById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateOrderStatus(id: string, status: any) {
    return this.prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  async findUserOrderHistory(email: string) {
    return this.prisma.order.findMany({
      where: {
        customerDetails: {
          path: ['email'],
          equals: email.trim().toLowerCase(),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
