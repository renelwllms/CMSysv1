import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { UpdateStaffSettingsDto } from './dto/update-staff-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    // Get the first (and should be only) settings record
    let settings = await this.prisma.settings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          businessName: 'My Cafe',
          businessNameId: 'Kafe Saya',
        },
      });
    }

    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto) {
    // Get existing settings or create if doesn't exist
    const existing = await this.getSettings();

    // Update settings
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: updateSettingsDto,
    });
  }

  async updateLogo(logoUrl: string) {
    const existing = await this.getSettings();
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: { logoUrl },
    });
  }

  async updateAppIcon(appIconUrl: string) {
    const existing = await this.getSettings();
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: { appIconUrl },
    });
  }

  async updateOgImage(ogImageUrl: string) {
    const existing = await this.getSettings();
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: { ogImageUrl },
    });
  }

  async updateStaffSettings(updateStaffSettingsDto: UpdateStaffSettingsDto) {
    const existing = await this.getSettings();
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: updateStaffSettingsDto,
    });
  }
}
