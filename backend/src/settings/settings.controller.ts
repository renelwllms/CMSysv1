import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateStaffSettingsDto } from './dto/update-staff-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { imageFileFilter, editFileName } from '../common/utils/file-upload.util';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(updateSettingsDto);
  }

  @Put('staff')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateStaffSettings(@Body() updateStaffSettingsDto: UpdateStaffSettingsDto) {
    return this.settingsService.updateStaffSettings(updateStaffSettingsDto);
  }

  @Post('upload-logo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/settings',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    const logoUrl = `/uploads/settings/${file.filename}`;
    return this.settingsService.updateLogo(logoUrl);
  }

  @Post('upload-app-icon')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('appIcon', {
      storage: diskStorage({
        destination: './uploads/settings',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadAppIcon(@UploadedFile() file: Express.Multer.File) {
    const appIconUrl = `/uploads/settings/${file.filename}`;
    return this.settingsService.updateAppIcon(appIconUrl);
  }

  @Post('upload-og-image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @UseInterceptors(
    FileInterceptor('ogImage', {
      storage: diskStorage({
        destination: './uploads/settings',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadOgImage(@UploadedFile() file: Express.Multer.File) {
    const ogImageUrl = `/uploads/settings/${file.filename}`;
    return this.settingsService.updateOgImage(ogImageUrl);
  }
}
