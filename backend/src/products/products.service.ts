import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  // --- PRODUCTS ---
  async findAllProducts(query: { category?: string; collection?: string; search?: string }) {
    const where: any = { isActive: true };

    if (query.category) {
      where.category = { slug: query.category };
    }
    if (query.collection) {
      where.collection = { slug: query.collection };
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        collection: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllProductsAdmin() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        collection: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, collection: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findProductBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true, collection: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async createProduct(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return this.prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug || slug,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        sizes: data.sizes || [],
        colors: data.colors || [],
        images: data.images || [],
        categoryId: data.categoryId || null,
        collectionId: data.collectionId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateProduct(id: string, data: any) {
    const updateData: any = { ...data };
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.stock !== undefined) updateData.stock = Number(data.stock);
    
    return this.prisma.product.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  // --- CATEGORIES ---
  async findAllCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug || slug,
      },
    });
  }

  async updateCategory(id: string, data: any) {
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  // --- COLLECTIONS ---
  async findAllCollections() {
    return this.prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllCollectionsAdmin() {
    return this.prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCollection(data: any) {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    return this.prisma.collection.create({
      data: {
        name: data.name,
        slug: data.slug || slug,
        description: data.description,
        bannerImage: data.bannerImage || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async updateCollection(id: string, data: any) {
    return this.prisma.collection.update({
      where: { id },
      data,
    });
  }

  async deleteCollection(id: string) {
    return this.prisma.collection.delete({ where: { id } });
  }
}
