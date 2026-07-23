import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../auth/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from '../storage/storage.service';

@Controller()
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly storageService: StorageService
  ) {}

  // --- PUBLIC ENDPOINTS ---

  @Get('products')
  async getProducts(
    @Query('category') category?: string,
    @Query('collection') collection?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAllProducts({ category, collection, search });
  }

  @Get('products/slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.productsService.findProductBySlug(slug);
  }

  @Get('categories')
  async getCategories() {
    return this.productsService.findAllCategories();
  }

  @Get('collections')
  async getCollections() {
    return this.productsService.findAllCollections();
  }

  // --- SECURED ADMIN ENDPOINTS ---

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('products/admin/all')
  async getProductsAdmin() {
    return this.productsService.findAllProductsAdmin();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('products/admin/:id')
  async getProductById(@Param('id') id: string) {
    return this.productsService.findProductById(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('products')
  async createProduct(@Body() body: any) {
    return this.productsService.createProduct(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('products/:id')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateProduct(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    // Optionally delete files from storage if deleting product, but we'll keep simple delete
    return this.productsService.deleteProduct(id);
  }

  // Categories Admin
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('categories')
  async createCategory(@Body() body: any) {
    return this.productsService.createCategory(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateCategory(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.productsService.deleteCategory(id);
  }

  // Collections Admin
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Get('collections/admin/all')
  async getCollectionsAdmin() {
    return this.productsService.findAllCollectionsAdmin();
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('collections')
  async createCollection(@Body() body: any) {
    return this.productsService.createCollection(body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Put('collections/:id')
  async updateCollection(@Param('id') id: string, @Body() body: any) {
    return this.productsService.updateCollection(id, body);
  }

  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Delete('collections/:id')
  async deleteCollection(@Param('id') id: string) {
    return this.productsService.deleteCollection(id);
  }

  // Media Upload Admin
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @Post('products/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const fileUrl = await this.storageService.uploadFile(file);
    return { url: fileUrl };
  }
}
