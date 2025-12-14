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

  async create(createTableDto: CreateTableDto, tenantId?: string) {
    // Check if table number already exists
    const existing = await this.prisma.table.findFirst({
      where: { tableNumber: createTableDto.tableNumber, ...(tenantId ? { tenantId } : {}) },
    });

    if (existing) {
      throw new ConflictException(`Table ${createTableDto.tableNumber} already exists`);
    }

    // Create table
    const table = await this.prisma.table.create({
      data: { ...createTableDto, tenantId },
    });

    // Generate QR code
    await this.generateQRCode(table.id, table.tableNumber);

    return this.findOne(table.id);
  }

  async findAll(tenantId?: string) {
    return this.prisma.table.findMany({
      where: tenantId ? { tenantId } : undefined,
      orderBy: { tableNumber: 'asc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
  }

  async findOne(id: string, tenantId?: string) {
    const table = await this.prisma.table.findUnique({
      where: { id, ...(tenantId ? { tenantId } : {}) },
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

  async update(id: string, updateTableDto: UpdateTableDto, tenantId?: string) {
    await this.findOne(id, tenantId);

    const updated = await this.prisma.table.update({
      where: { id, ...(tenantId ? { tenantId } : {}) },
      data: updateTableDto,
    });

    // Regenerate QR code if table number changed
    if (updateTableDto.tableNumber) {
      await this.generateQRCode(updated.id, updated.tableNumber);
    }

    return this.findOne(id);
  }

  async remove(id: string, tenantId?: string) {
    await this.findOne(id, tenantId);

    // Delete QR code file
    const table = await this.prisma.table.findUnique({ where: { id, ...(tenantId ? { tenantId } : {}) } });
    if (table?.qrCode) {
      this.deleteQRCodeFile(table.qrCode);
    }

    return this.prisma.table.delete({ where: { id } });
  }

  async generateQRCode(tableId: string, tableNumber: string) {
    const orderUrl = `${this.frontendUrl}/order?table=${tableId}`;
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

  async regenerateQRCode(id: string, tenantId?: string) {
    const table = await this.findOne(id, tenantId);

    // Delete old QR code
    if (table.qrCode) {
      this.deleteQRCodeFile(table.qrCode);
    }

    // Generate new QR code
    await this.generateQRCode(table.id, table.tableNumber);

    return this.findOne(id);
  }

  async getQRCodeData(id: string, tenantId?: string) {
    const table = await this.findOne(id, tenantId);

    if (!table.qrCode) {
      throw new NotFoundException('QR code not found for this table');
    }

    const qrCodePath = path.join(process.cwd(), table.qrCode);

    if (!fs.existsSync(qrCodePath)) {
      throw new NotFoundException('QR code file not found');
    }

    return {
      tableNumber: table.tableNumber,
      qrCodeUrl: table.qrCode,
      orderUrl: `${this.frontendUrl}/order?table=${table.id}`,
    };
  }

  async toggleActive(id: string, tenantId?: string) {
    const table = await this.findOne(id, tenantId);

    return this.prisma.table.update({
      where: { id, ...(tenantId ? { tenantId } : {}) },
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
}
