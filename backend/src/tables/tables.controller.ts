import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Req,
} from '@nestjs/common';
import type { Response } from 'express';
import { TablesService } from './tables.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import * as path from 'path';
import * as fs from 'fs';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() createTableDto: CreateTableDto, @Req() req: any) {
    return this.tablesService.create(createTableDto, req?.tenant?.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.tablesService.findAll(req?.tenant?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tablesService.findOne(id, req?.tenant?.id);
  }

  @Get(':id/qr-code')
  async getQRCodeData(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const table = await this.tablesService.findOne(id, req?.tenant?.id);

    if (!table.qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const qrCodePath = path.join(process.cwd(), table.qrCode);

    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: 'QR code file not found' });
    }

    // Serve the QR code image directly
    res.setHeader('Content-Type', 'image/png');
    res.sendFile(qrCodePath);
  }

  @Get(':id/qr-code/download')
  async downloadQRCode(@Param('id') id: string, @Res() res: Response, @Req() req: any) {
    const table = await this.tablesService.findOne(id, req?.tenant?.id);

    if (!table.qrCode) {
      return res.status(404).json({ message: 'QR code not found' });
    }

    const qrCodePath = path.join(process.cwd(), table.qrCode);

    if (!fs.existsSync(qrCodePath)) {
      return res.status(404).json({ message: 'QR code file not found' });
    }

    res.download(qrCodePath, `table-${table.tableNumber}-qr.png`);
  }

  @Post(':id/regenerate-qr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  regenerateQRCode(@Param('id') id: string, @Req() req: any) {
    return this.tablesService.regenerateQRCode(id, req?.tenant?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto, @Req() req: any) {
    return this.tablesService.update(id, updateTableDto, req?.tenant?.id);
  }

  @Patch(':id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  toggleActive(@Param('id') id: string, @Req() req: any) {
    return this.tablesService.toggleActive(id, req?.tenant?.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tablesService.remove(id, req?.tenant?.id);
  }
}
