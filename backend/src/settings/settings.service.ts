import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(tenantId?: string) {
    // Get the first (and should be only) settings record for this tenant
    let settings = await this.prisma.settings.findFirst({
      where: tenantId ? { tenantId } : undefined,
    });

    // If no settings exist, create default settings
    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {
          businessName: 'My Cafe',
          businessNameId: 'Kafe Saya',
          tenantId,
        },
      });
    }

    return settings;
  }

  async updateSettings(updateSettingsDto: UpdateSettingsDto, tenantId?: string) {
    // Get existing settings or create if doesn't exist
    const existing = await this.getSettings(tenantId);

    // Update settings
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: updateSettingsDto,
    });
  }

  async updateLogo(logoUrl: string, tenantId?: string) {
    const existing = await this.getSettings(tenantId);
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: { logoUrl },
    });
  }

  async updateOgImage(ogImageUrl: string, tenantId?: string) {
    const existing = await this.getSettings(tenantId);
    return this.prisma.settings.update({
      where: { id: existing.id },
      data: { ogImageUrl },
    });
  }
}
