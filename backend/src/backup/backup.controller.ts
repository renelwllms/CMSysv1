import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { BackupService } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async downloadBackup(@Res({ passthrough: true }) res: Response): Promise<unknown> {
    const payload = await this.backupService.createBackup();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="cms-backup-${timestamp}.json"`);
    return payload;
  }

  @Post('restore')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('backup', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async restoreBackup(@UploadedFile() file: Express.Multer.File): Promise<unknown> {
    if (!file) {
      throw new BadRequestException('Backup file is required.');
    }
    let payload: any;
    try {
      payload = JSON.parse(file.buffer.toString('utf-8'));
    } catch (error) {
      throw new BadRequestException('Backup file is not valid JSON.');
    }

    return this.backupService.restoreBackup(payload);
  }
}
