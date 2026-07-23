import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private static getPrismaOptions() {
    const connectionString = process.env.DATABASE_URL || 'postgresql://latinbrou_user:latinbrou_db_password_2026@localhost:5435/latinbrou_database?schema=public';
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    return { adapter };
  }

  constructor() {
    super(PrismaService.getPrismaOptions());
  }

  async onModuleInit() {
    await this.$connect();
    
    // 1. Seed default admin user
    const adminEmail = 'admin@latinbrou.com';
    const adminExists = await this.user.findUnique({ where: { email: adminEmail } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin_latinbrou_2026', 10);
      await this.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: 'Admin Latin Brou',
          isAdmin: true,
        },
      });
      console.log('--- DEFAULT ADMIN SEEDED ---');
    }

    // 2. Seed default categories
    const categoriesCount = await this.category.count();
    let remerasCat, pantalonesCat, hoodiesCat, crewnecksCat;
    if (categoriesCount === 0) {
      remerasCat = await this.category.create({ data: { name: 'Remeras', slug: 'remeras' } });
      pantalonesCat = await this.category.create({ data: { name: 'Pantalones', slug: 'pantalones' } });
      hoodiesCat = await this.category.create({ data: { name: 'Hoodies', slug: 'hoodies' } });
      crewnecksCat = await this.category.create({ data: { name: 'Crewnecks', slug: 'crewnecks' } });
      console.log('--- DEFAULT CATEGORIES SEEDED ---');
    } else {
      remerasCat = await this.category.findFirst({ where: { slug: 'remeras' } });
      pantalonesCat = await this.category.findFirst({ where: { slug: 'pantalones' } });
      hoodiesCat = await this.category.findFirst({ where: { slug: 'hoodies' } });
      crewnecksCat = await this.category.findFirst({ where: { slug: 'crewnecks' } });
    }

    // 3. Seed default collections
    const collectionsCount = await this.collection.count();
    let barrioCol, calleCol, nocheCol;
    if (collectionsCount === 0) {
      barrioCol = await this.collection.create({ data: { name: 'Barrio Series', slug: 'barrio-series', description: 'Calles, murales y noches. La identidad del asfalto en cada hilo.', bannerImage: '', isActive: true } });
      calleCol = await this.collection.create({ data: { name: 'Calle Latina', slug: 'calle-latina', description: 'Culturas que se mezclan. Graffiti, trap y el sabor latinoamericano.', bannerImage: '', isActive: true } });
      nocheCol = await this.collection.create({ data: { name: 'Noche Urbana', slug: 'noche-urbana', description: 'Para los que manejan de noche. Oscuro, elegante, auténtico.', bannerImage: '', isActive: true } });
      console.log('--- DEFAULT COLLECTIONS SEEDED ---');
    } else {
      barrioCol = await this.collection.findFirst({ where: { slug: 'barrio-series' } });
      calleCol = await this.collection.findFirst({ where: { slug: 'calle-latina' } });
      nocheCol = await this.collection.findFirst({ where: { slug: 'noche-urbana' } });
    }

    // 4. Seed default products
    const productsCount = await this.product.count();
    if (productsCount === 0) {
      await this.product.create({
        data: {
          name: 'OVERSIZED TEE BLACK',
          slug: 'oversized-tee-black',
          price: 12900,
          stock: 20,
          sizes: ['S','M','L','XL','XXL'],
          colors: ['Negro','Blanco'],
          images: [],
          description: 'Remera oversized en algodón premium 100%. Fit holgado, ideal para el look callejero.',
          isActive: true,
          categoryId: remerasCat?.id || null,
        }
      });
      await this.product.create({
        data: {
          name: 'CARGO PANTS URBAN',
          slug: 'cargo-pants-urban',
          price: 18500,
          stock: 15,
          sizes: ['28','30','32','34','36'],
          colors: ['Negro','Oliva'],
          images: [],
          description: 'Cargo para el que sabe moverse. Múltiples bolsillos, tela de alta resistencia.',
          isActive: true,
          categoryId: pantalonesCat?.id || null,
        }
      });
      await this.product.create({
        data: {
          name: 'HOODIE BARRIO SERIES',
          slug: 'hoodie-barrio-series',
          price: 22000,
          stock: 10,
          sizes: ['S','M','L','XL'],
          colors: ['Negro','Gris Oscuro'],
          images: [],
          description: 'Hoodie con bordado exclusivo de la colección Barrio Series. Frío o no, siempre con estilo.',
          isActive: true,
          categoryId: hoodiesCat?.id || null,
          collectionId: barrioCol?.id || null,
        }
      });
      await this.product.create({
        data: {
          name: 'CREWNECK LATIN BROÚ',
          slug: 'crewneck-latin-brou',
          price: 19800,
          stock: 8,
          sizes: ['S','M','L','XL','XXL'],
          colors: ['Negro','Blanco','Rojo'],
          images: [],
          description: 'El clásico renovado. Crewneck con el logo de la marca en relieve, de edición limitada.',
          isActive: true,
          categoryId: crewnecksCat?.id || null,
          collectionId: barrioCol?.id || null,
        }
      });
      console.log('--- DEFAULT PRODUCTS SEEDED ---');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
