import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

interface BackupFile {
  path: string;
  contentBase64: string;
}

interface BackupPayload {
  type: 'cms-backup';
  version: number;
  createdAt: string;
  tenant: Record<string, any> | null;
  data: {
    settings: Record<string, any> | null;
    users: Record<string, any>[];
    menuItems: Record<string, any>[];
    tables: Record<string, any>[];
    orders: Record<string, any>[];
    orderItems: Record<string, any>[];
    payments: Record<string, any>[];
    whatsappSettings: Record<string, any> | null;
  };
  files: BackupFile[];
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);

  constructor(private prisma: PrismaService) {}

  async createBackup(): Promise<BackupPayload> {
    const settings = await this.prisma.settings.findFirst();
    const users = await this.prisma.user.findMany({
    });
    const menuItems = await this.prisma.menuItem.findMany({
    });
    const tables = await this.prisma.table.findMany({
    });
    const orders = await this.prisma.order.findMany({
    });
    const orderIds = orders.map((order) => order.id);
    const orderItems = orderIds.length
      ? await this.prisma.orderItem.findMany({ where: { orderId: { in: orderIds } } })
      : [];
    const payments = orderIds.length
      ? await this.prisma.payment.findMany({ where: { orderId: { in: orderIds } } })
      : [];
    const whatsappSettings = await this.prisma.whatsAppSettings.findFirst({
    });

    const filePaths = new Set<string>();
    const addFilePath = (value?: string | null) => {
      if (!value) return;
      if (value.startsWith('/uploads/')) {
        filePaths.add(value);
      }
    };

    addFilePath(settings?.logoUrl || null);
    addFilePath(settings?.appIconUrl || null);
    addFilePath(settings?.ogImageUrl || null);
    menuItems.forEach((item) => addFilePath(item.imageUrl || null));
    tables.forEach((table) => addFilePath(table.qrCode || null));
    payments.forEach((payment) => addFilePath(payment.paymentProof || null));

    const files = await this.collectFiles(Array.from(filePaths));

    return {
      type: 'cms-backup',
      version: 1,
      createdAt: new Date().toISOString(),
      tenant: null,
      data: {
        settings: settings ? { ...settings } : null,
        users,
        menuItems,
        tables,
        orders,
        orderItems,
        payments,
        whatsappSettings: whatsappSettings ? { ...whatsappSettings } : null,
      },
      files,
    };
  }

  async restoreBackup(payload: any) {
    const backup = this.normalizeBackupPayload(payload);
    await this.restoreFiles(backup.files);

    const stripTenantId = <T extends Record<string, any>>(data: T) => {
      const next = { ...data };
      delete (next as any).tenantId;
      return next;
    };

    await this.prisma.$transaction(async (tx) => {
      const existingOrders = await tx.order.findMany({
        select: { id: true },
      });
      const existingOrderIds = existingOrders.map((order) => order.id);

      if (existingOrderIds.length) {
        await tx.orderItem.deleteMany({ where: { orderId: { in: existingOrderIds } } });
        await tx.payment.deleteMany({ where: { orderId: { in: existingOrderIds } } });
      }

      await tx.order.deleteMany();
      await tx.menuItem.deleteMany();
      await tx.table.deleteMany();
      await tx.user.deleteMany();
      await tx.settings.deleteMany();
      await tx.whatsAppLog.deleteMany();
      await tx.whatsAppSettings.deleteMany();

      if (backup.data.settings) {
        const settingsData = stripTenantId(backup.data.settings);
        await tx.settings.create({
          data: {
            ...settingsData,
          },
        });
      }

      if (backup.data.users.length) {
        const usersData: Prisma.UserCreateManyInput[] = backup.data.users.map((user) =>
          stripTenantId(user as Prisma.UserCreateManyInput & Record<string, any>),
        );
        await tx.user.createMany({
          data: usersData,
        });
      }

      if (backup.data.menuItems.length) {
        const menuItemsData: Prisma.MenuItemCreateManyInput[] = backup.data.menuItems.map((item) =>
          stripTenantId(item as Prisma.MenuItemCreateManyInput & Record<string, any>),
        );
        await tx.menuItem.createMany({
          data: menuItemsData,
        });
      }

      if (backup.data.tables.length) {
        const tablesData: Prisma.TableCreateManyInput[] = backup.data.tables.map((table) =>
          stripTenantId(table as Prisma.TableCreateManyInput & Record<string, any>),
        );
        await tx.table.createMany({
          data: tablesData,
        });
      }

      if (backup.data.orders.length) {
        const ordersData: Prisma.OrderCreateManyInput[] = backup.data.orders.map((order) =>
          stripTenantId(order as Prisma.OrderCreateManyInput & Record<string, any>),
        );
        await tx.order.createMany({
          data: ordersData,
        });
      }

      if (backup.data.orderItems.length) {
        const orderItemsData = backup.data.orderItems as Prisma.OrderItemCreateManyInput[];
        await tx.orderItem.createMany({
          data: orderItemsData,
        });
      }

      if (backup.data.payments.length) {
        const paymentsData: Prisma.PaymentCreateManyInput[] = backup.data.payments.map((payment) =>
          stripTenantId(payment as Prisma.PaymentCreateManyInput & Record<string, any>),
        );
        await tx.payment.createMany({
          data: paymentsData,
        });
      }

      if (backup.data.whatsappSettings) {
        const whatsappSettingsData = stripTenantId(backup.data.whatsappSettings);
        await tx.whatsAppSettings.create({
          data: {
            ...whatsappSettingsData,
          },
        });
      }
    });

    return {
      restored: {
        settings: backup.data.settings ? 1 : 0,
        users: backup.data.users.length,
        menuItems: backup.data.menuItems.length,
        tables: backup.data.tables.length,
        orders: backup.data.orders.length,
        orderItems: backup.data.orderItems.length,
        payments: backup.data.payments.length,
        whatsappSettings: backup.data.whatsappSettings ? 1 : 0,
        files: backup.files.length,
      },
    };
  }

  private normalizeBackupPayload(payload: any): BackupPayload {
    if (!payload || payload.type !== 'cms-backup') {
      throw new BadRequestException('Invalid backup file.');
    }

    const data = payload.data || {};
    const files = Array.isArray(payload.files) ? payload.files : [];

    return {
      type: 'cms-backup',
      version: payload.version || 1,
      createdAt: payload.createdAt || new Date().toISOString(),
      tenant: payload.tenant || null,
      data: {
        settings: data.settings || null,
        users: Array.isArray(data.users) ? data.users : [],
        menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
        tables: Array.isArray(data.tables) ? data.tables : [],
        orders: Array.isArray(data.orders) ? data.orders : [],
        orderItems: Array.isArray(data.orderItems) ? data.orderItems : [],
        payments: Array.isArray(data.payments) ? data.payments : [],
        whatsappSettings: data.whatsappSettings || null,
      },
      files: files.filter((file) => file?.path && file?.contentBase64),
    };
  }

  private async collectFiles(uploadPaths: string[]): Promise<BackupFile[]> {
    const uploadsRoots = await this.resolveUploadsRoots();
    if (!uploadsRoots.length) {
      this.logger.warn('Uploads directory not found. Backup will exclude files.');
      return [];
    }

    const files: BackupFile[] = [];
    for (const uploadPath of uploadPaths) {
      const normalizedUploadPath = this.normalizeUploadPath(uploadPath);
      if (!normalizedUploadPath) continue;

      const relativePath = normalizedUploadPath.replace(/^\/?uploads[\\/]/, '');
      let foundPath: string | null = null;

      for (const root of uploadsRoots) {
        const candidate = path.join(root, relativePath);
        if (await this.pathExists(candidate)) {
          foundPath = candidate;
          break;
        }
      }

      if (!foundPath) {
        this.logger.warn(`Backup skipped missing file: ${normalizedUploadPath}`);
        continue;
      }

      const content = await fs.readFile(foundPath);
      files.push({
        path: normalizedUploadPath,
        contentBase64: content.toString('base64'),
      });
    }

    return files;
  }

  private async restoreFiles(files: BackupFile[]) {
    if (!files.length) return;

    const uploadsRoot = await this.resolvePrimaryUploadsRoot();
    if (!uploadsRoot) {
      throw new BadRequestException('Uploads directory not found for restore.');
    }

    for (const file of files) {
      const normalizedUploadPath = this.normalizeUploadPath(file.path);
      if (!normalizedUploadPath) continue;

      const relativePath = normalizedUploadPath.replace(/^\/?uploads[\\/]/, '');
      const destination = path.join(uploadsRoot, relativePath);
      const normalizedDestination = path.normalize(destination);

      if (!normalizedDestination.startsWith(path.normalize(uploadsRoot + path.sep))) {
        throw new BadRequestException(`Invalid backup file path: ${file.path}`);
      }

      await fs.mkdir(path.dirname(normalizedDestination), { recursive: true });
      await fs.writeFile(normalizedDestination, Buffer.from(file.contentBase64, 'base64'));
    }
  }

  private normalizeUploadPath(uploadPath: string | null | undefined): string | null {
    if (!uploadPath || !uploadPath.startsWith('/uploads/')) return null;
    return uploadPath.replace(/\\/g, '/');
  }

  private async resolveUploadsRoots(): Promise<string[]> {
    const candidates = [
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), '..', 'uploads'),
    ];
    const existing: string[] = [];
    for (const candidate of candidates) {
      if (await this.pathExists(candidate)) {
        existing.push(candidate);
      }
    }
    return existing;
  }

  private async resolvePrimaryUploadsRoot(): Promise<string | null> {
    const roots = await this.resolveUploadsRoots();
    if (roots.length) {
      return roots[0];
    }
    return path.join(process.cwd(), 'uploads');
  }

  private async pathExists(targetPath: string) {
    try {
      await fs.access(targetPath);
      return true;
    } catch {
      return false;
    }
  }
}
