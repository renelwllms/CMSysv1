import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { imageFileFilter, editFileName } from '../common/utils/file-upload.util';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSettings(@Req() req: any) {
    return this.settingsService.getSettings(req?.tenant?.id);
  }

  @Put()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  updateSettings(@Body() updateSettingsDto: UpdateSettingsDto, @Req() req: any) {
    return this.settingsService.updateSettings(updateSettingsDto, req?.tenant?.id);
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
  async uploadLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const logoUrl = `/uploads/settings/${file.filename}`;
    return this.settingsService.updateLogo(logoUrl, req?.tenant?.id);
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
  async uploadOgImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const ogImageUrl = `/uploads/settings/${file.filename}`;
    return this.settingsService.updateOgImage(ogImageUrl, req?.tenant?.id);
  }
}
