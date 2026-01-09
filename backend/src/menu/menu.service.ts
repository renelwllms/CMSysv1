import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_MENU_CATEGORIES = [
  'DRINKS',
  'MAIN_FOODS',
  'SNACKS',
  'CABINET_FOOD',
  'CAKES',
  'GIFTS',
];

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto, imageUrl?: string) {
    const sizes = createMenuItemDto.sizes ? (createMenuItemDto.sizes as any) : undefined;
    const resolvedPrice =
      createMenuItemDto.price ?? (Array.isArray(sizes) && sizes.length > 0 ? sizes[0].price : undefined);

    if (resolvedPrice === undefined) {
      throw new BadRequestException('Price is required when no sizes are provided');
    }

    return this.prisma.menuItem.create({
      data: {
        name: createMenuItemDto.name,
        nameId: createMenuItemDto.nameId,
        description: createMenuItemDto.description,
        descriptionId: createMenuItemDto.descriptionId,
        price: resolvedPrice,
        category: createMenuItemDto.category,
        stockQty: createMenuItemDto.stockQty,
        isAvailable: createMenuItemDto.isAvailable ?? true,
        imageUrl,
        sizes,
      },
    });
  }

  async findAll(
    category?: string,
    isAvailable?: boolean,
    search?: string,
  ) {
    const where: any = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    if (search) {
      const term = search.trim();
      if (term.length > 0) {
        where.OR = [
          { name: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
          { nameId: { contains: term, mode: 'insensitive' } },
          { descriptionId: { contains: term, mode: 'insensitive' } },
        ];
      }
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
    if (updateMenuItemDto.sizes !== undefined) updateData.sizes = updateMenuItemDto.sizes as any;

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

  async findByCategory(category: string) {
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
    const stored = await this.prisma.menuItem.findMany({
      where: { isActive: true },
      distinct: ['category'],
      select: { category: true },
    });

    const dynamicCategories = stored
      .map((entry) => entry.category)
      .filter((category): category is string => Boolean(category));

    const merged = new Set<string>([...DEFAULT_MENU_CATEGORIES, ...dynamicCategories]);
    const defaults = DEFAULT_MENU_CATEGORIES.filter((category) => merged.has(category));
    const extras = Array.from(merged).filter((category) => !DEFAULT_MENU_CATEGORIES.includes(category)).sort();
    return [...defaults, ...extras];
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
