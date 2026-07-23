import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  async validateCoupon(code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: { code: code.toUpperCase() }
    });

    if (!coupon) {
      throw new NotFoundException('Cupón no encontrado');
    }

    if (!coupon.isActive) {
      throw new BadRequestException('El cupón no está activo');
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      throw new BadRequestException('El cupón ha expirado');
    }

    return {
      code: coupon.code,
      discountType: coupon.discountType,
      value: coupon.value
    };
  }

  async findAllCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCoupon(data: any) {
    return this.prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        value: parseFloat(data.value),
        isActive: data.isActive !== undefined ? data.isActive : true,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
      }
    });
  }

  async updateCoupon(id: string, data: any) {
    return this.prisma.coupon.update({
      where: { id },
      data: {
        code: data.code?.toUpperCase(),
        discountType: data.discountType,
        value: data.value !== undefined ? parseFloat(data.value) : undefined,
        isActive: data.isActive,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null
      }
    });
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}
