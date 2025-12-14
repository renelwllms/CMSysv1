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
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { MenuService } from './menu.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, MenuCategory } from '@prisma/client';
import { imageFileFilter, editFileName } from '../common/utils/file-upload.util';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/menu-items/${file.filename}` : undefined;
    const tenantId = req?.tenant?.id;
    return this.menuService.create(createMenuItemDto, tenantId, imageUrl);
  }

  @Get()
  findAll(
    @Query('category') category?: MenuCategory,
    @Query('isAvailable') isAvailable?: string,
    @Req() req?: any,
  ) {
    const available = isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined;
    const tenantId = req?.tenant?.id;
    return this.menuService.findAll(tenantId, category, available);
  }

  @Get('categories')
  getCategories() {
    return this.menuService.getCategories();
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  getCategoryStats(@Req() req: any) {
    return this.menuService.getCategoryStats(req?.tenant?.id);
  }

  @Get('category/:category')
  findByCategory(@Param('category') category: MenuCategory, @Req() req: any) {
    return this.menuService.findByCategory(category, req?.tenant?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.menuService.findOne(id, req?.tenant?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
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
    @Req() req: any,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imageUrl = file ? `/uploads/menu-items/${file.filename}` : undefined;
    return this.menuService.update(id, req?.tenant?.id, updateMenuItemDto, imageUrl);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  updateStock(@Param('id') id: string, @Body('stockQty') stockQty: number, @Req() req: any) {
    if (typeof stockQty !== 'number') {
      throw new BadRequestException('Stock quantity must be a number');
    }
    return this.menuService.updateStock(id, req?.tenant?.id, stockQty);
  }

  @Patch(':id/toggle-availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  toggleAvailability(@Param('id') id: string, @Req() req: any) {
    return this.menuService.toggleAvailability(id, req?.tenant?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.menuService.remove(id, req?.tenant?.id);
  }
}
