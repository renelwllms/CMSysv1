import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class TablesService {
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
  }

  async create(createTableDto: CreateTableDto, req?: any) {
    // Check if table number already exists
    const existing = await this.prisma.table.findFirst({
      where: { tableNumber: createTableDto.tableNumber },
    });

    if (existing) {
      throw new ConflictException(`Table ${createTableDto.tableNumber} already exists`);
    }

    // Create table
    const table = await this.prisma.table.create({
      data: { ...createTableDto },
    });

    // Generate QR code
    await this.generateQRCode(table.id, table.tableNumber, req);

    return this.findOne(table.id);
  }

  async findAll() {
    return this.prisma.table.findMany({
      orderBy: { tableNumber: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`);
    }

    return table;
  }

  async update(id: string, updateTableDto: UpdateTableDto, req?: any) {
    await this.findOne(id);

    const updated = await this.prisma.table.update({
      where: { id },
      data: updateTableDto,
    });

    // Regenerate QR code if table number changed
    if (updateTableDto.tableNumber) {
      await this.generateQRCode(updated.id, updated.tableNumber, req);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);

    // Delete QR code file
    const table = await this.prisma.table.findUnique({ where: { id } });
    if (table?.qrCode) {
      this.deleteQRCodeFile(table.qrCode);
    }

    return this.prisma.table.delete({ where: { id } });
  }

  async generateQRCode(tableId: string, tableNumber: string, req?: any) {
    const frontendUrl = this.resolveFrontendUrl(req);
    const orderUrl = `${frontendUrl}/order?table=${tableId}`;
    const qrCodeFileName = `table-${tableNumber}-${Date.now()}.png`;
    const qrCodePath = path.join(process.cwd(), 'uploads', 'qr-codes', qrCodeFileName);

    try {
      // Ensure directory exists
      const qrDir = path.join(process.cwd(), 'uploads', 'qr-codes');
      if (!fs.existsSync(qrDir)) {
        fs.mkdirSync(qrDir, { recursive: true });
      }

      // Generate QR code
      await QRCode.toFile(qrCodePath, orderUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      const qrCodeUrl = `/uploads/qr-codes/${qrCodeFileName}`;

      // Update table with QR code path
      await this.prisma.table.update({
        where: { id: tableId },
        data: { qrCode: qrCodeUrl },
      });

      return qrCodeUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  }

  async regenerateQRCode(id: string, req?: any) {
    const table = await this.findOne(id);

    // Delete old QR code
    if (table.qrCode) {
      this.deleteQRCodeFile(table.qrCode);
    }

    // Generate new QR code
    await this.generateQRCode(table.id, table.tableNumber, req);

    return this.findOne(id);
  }

  async getQRCodeData(id: string) {
    const table = await this.findOne(id);

    if (!table.qrCode) {
      throw new NotFoundException('QR code not found for this table');
    }

    const qrCodePath = path.join(process.cwd(), table.qrCode);

    if (!fs.existsSync(qrCodePath)) {
      throw new NotFoundException('QR code file not found');
    }

    const frontendUrl = this.resolveFrontendUrl();
    return {
      tableNumber: table.tableNumber,
      qrCodeUrl: table.qrCode,
      orderUrl: `${frontendUrl}/order?table=${table.id}`,
    };
  }

  async toggleActive(id: string) {
    const table = await this.findOne(id);

    return this.prisma.table.update({
      where: { id },
      data: { isActive: !table.isActive },
    });
  }

  private deleteQRCodeFile(qrCodeUrl: string) {
    try {
      const filePath = path.join(process.cwd(), qrCodeUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Error deleting QR code file:', error);
    }
  }

  private resolveFrontendUrl(req?: any) {
    const origin = req?.headers?.origin;
    if (origin) {
      return origin.replace(/\/$/, '');
    }

    const forwardedHost = req?.headers?.['x-forwarded-host'] || req?.headers?.host;
    const forwardedProto = req?.headers?.['x-forwarded-proto'] || req?.protocol;
    if (forwardedHost) {
      const proto = typeof forwardedProto === 'string'
        ? forwardedProto.split(',')[0].trim()
        : 'http';
      const host = typeof forwardedHost === 'string'
        ? forwardedHost.split(',')[0].trim()
        : forwardedHost;
      return `${proto || 'http'}://${host}`;
    }

    return this.frontendUrl;
  }
}
