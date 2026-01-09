import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { WhatsappService } from './whatsapp.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UpdateWhatsappSettingsDto } from './dto/update-whatsapp-settings.dto';
import { SendTestMessageDto } from './dto/send-test-message.dto';

@Controller()
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('admin/whatsapp-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSettings() {
    const settings = await this.whatsappService.getSettings();
    return this.whatsappService.sanitizeSettings(settings);
  }

  @Post('admin/whatsapp-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateSettings(@Body() body: UpdateWhatsappSettingsDto) {
    return this.whatsappService.updateSettings(body);
  }

  @Post('admin/whatsapp-settings/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async sendTestMessage(@Body() body: SendTestMessageDto) {
    return this.whatsappService.sendTestMessage(body);
  }

  @Get('webhooks/whatsapp')
  async verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const settings = await this.whatsappService.getSettings();
    if (mode === 'subscribe' && token && token === settings.webhookVerifyToken) {
      return res.status(200).send(challenge);
    }
    return res.status(403).send('Forbidden');
  }

  @Post('webhooks/whatsapp')
  async handleWebhook(@Body() body: any) {
    await this.whatsappService.logInboundWebhook(body);
    return { received: true };
  }
}
