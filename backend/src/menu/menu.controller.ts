import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { imageFileFilter, editFileName } from '../common/utils/file-upload.util';

const normalizeCategory = (value?: string) => {
  if (!value) return undefined;
  return value
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
};

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/menu-items',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async create(
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/menu-items/${file.filename}` : undefined;
    return this.menuService.create(createMenuItemDto, imageUrl);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('search') search?: string,
  ) {
    const available = isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined;
    const normalizedCategory = normalizeCategory(category);
    return this.menuService.findAll(normalizedCategory, available, search);
  }

  @Get('items')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findItems(
    @Query('categoryId') categoryId?: string,
    @Query('category') category?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('search') search?: string,
  ) {
    const available = isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined;
    const resolvedCategory = normalizeCategory(categoryId || category);
    return this.menuService.findAll(resolvedCategory, available, search);
  }

  @Get('categories')
  getCategories() {
    return this.menuService.getCategories();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  getCategoryStats() {
    return this.menuService.getCategoryStats();
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: string) {
    return this.menuService.findByCategory(normalizeCategory(category) || category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/menu-items',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/menu-items/${file.filename}` : undefined;
    return this.menuService.update(id, updateMenuItemDto, imageUrl);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  updateStock(@Param('id') id: string, @Body('stockQty') stockQty: number) {
    if (typeof stockQty !== 'number') {
      throw new BadRequestException('Stock quantity must be a number');
    }
    return this.menuService.updateStock(id, stockQty);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  toggleAvailability(@Param('id') id: string) {
    return this.menuService.toggleAvailability(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.menuService.remove(id);
  }
}
