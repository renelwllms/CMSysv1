import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { MenuCategory } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto, imageUrl?: string) {
    return this.prisma.menuItem.create({
      data: {
        name: createMenuItemDto.name,
        nameId: createMenuItemDto.nameId,
        description: createMenuItemDto.description,
        descriptionId: createMenuItemDto.descriptionId,
        price: createMenuItemDto.price,
        category: createMenuItemDto.category,
        stockQty: createMenuItemDto.stockQty,
        isAvailable: createMenuItemDto.isAvailable ?? true,
        imageUrl,
      },
    });
  }

  async findAll(category?: MenuCategory, isAvailable?: boolean) {
    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    return this.prisma.menuItem.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto, imageUrl?: string) {
    const menuItem = await this.findOne(id);

    // If new image is uploaded, delete old one
    if (imageUrl && menuItem.imageUrl) {
      this.deleteImageFile(menuItem.imageUrl);
    }

    const updateData: any = {};
    if (updateMenuItemDto.name !== undefined) updateData.name = updateMenuItemDto.name;
    if (updateMenuItemDto.nameId !== undefined) updateData.nameId = updateMenuItemDto.nameId;
    if (updateMenuItemDto.description !== undefined) updateData.description = updateMenuItemDto.description;
    if (updateMenuItemDto.descriptionId !== undefined) updateData.descriptionId = updateMenuItemDto.descriptionId;
    if (updateMenuItemDto.price !== undefined) updateData.price = updateMenuItemDto.price;
    if (updateMenuItemDto.category !== undefined) updateData.category = updateMenuItemDto.category;
    if (updateMenuItemDto.stockQty !== undefined) updateData.stockQty = updateMenuItemDto.stockQty;
    if (updateMenuItemDto.isAvailable !== undefined) updateData.isAvailable = updateMenuItemDto.isAvailable;
    if (imageUrl) updateData.imageUrl = imageUrl;

    return this.prisma.menuItem.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const menuItem = await this.findOne(id);

    // Soft delete by setting isActive to false
    const deleted = await this.prisma.menuItem.update({
      where: { id },
      data: { isActive: false },
    });

    // Optionally delete the image
    if (menuItem.imageUrl) {
      this.deleteImageFile(menuItem.imageUrl);
    }

    return deleted;
  }

  async updateStock(id: string, stockQty: number) {
    if (stockQty < 0) {
      throw new BadRequestException('Stock quantity cannot be negative');
    }

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        stockQty,
        isAvailable: stockQty > 0,
      },
    });
  }

  async findByCategory(category: MenuCategory) {
    return this.prisma.menuItem.findMany({
      where: {
        category,
        isActive: true,
        isAvailable: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async toggleAvailability(id: string) {
    const menuItem = await this.findOne(id);

    return this.prisma.menuItem.update({
      where: { id },
      data: {
        isAvailable: !menuItem.isAvailable,
      },
    });
  }

  private deleteImageFile(imageUrl: string) {
    try {
      const filePath = path.join(process.cwd(), imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting image file:', error);
    }
  }

  async getCategories() {
    return Object.values(MenuCategory);
  }

  async getCategoryStats() {
    const stats = await this.prisma.menuItem.groupBy({
      by: ['category'],
      where: { isActive: true },
      _count: {
        id: true,
      },
    });

    return stats.map(stat => ({
      category: stat.category,
      count: stat._count.id,
    }));
  }
}
