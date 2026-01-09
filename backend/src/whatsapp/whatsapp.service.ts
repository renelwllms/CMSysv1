import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateWhatsappSettingsDto } from './dto/update-whatsapp-settings.dto';
import { SendTestMessageDto } from './dto/send-test-message.dto';
import { SendWhatsAppMessageParams } from './interfaces/send-whatsapp-message.interface';
import { WhatsAppMessageDirection, Prisma } from '@prisma/client';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiVersion = process.env.WHATSAPP_API_VERSION || 'v20.0';

  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    let settings = await this.prisma.whatsAppSettings.findFirst({
    });

    if (!settings) {
      settings = await this.prisma.whatsAppSettings.create({
        data: {},
      });
    }

    return settings;
  }

  sanitizeSettings(settings: Awaited<ReturnType<typeof this.getSettings>>) {
    if (!settings) return null;
    const { accessToken, ...rest } = settings;
    return {
      ...rest,
      accessTokenMasked: accessToken ? this.maskToken(accessToken) : null,
      hasAccessToken: Boolean(accessToken),
    };
  }

  async updateSettings(dto: UpdateWhatsappSettingsDto) {
    const existing = await this.getSettings();
    const nextEnabled = dto.enabled ?? existing.enabled;

    if (nextEnabled) {
      const missing: string[] = [];
      if (!dto.phoneNumberId && !existing.phoneNumberId) missing.push('phoneNumberId');
      if (!dto.businessAccountId && !existing.businessAccountId) missing.push('businessAccountId');
      if (!dto.webhookVerifyToken && !existing.webhookVerifyToken) missing.push('webhookVerifyToken');
      if (!dto.accessToken && !existing.accessToken) missing.push('accessToken');

      if (missing.length) {
        throw new BadRequestException(
          `Missing required fields for enabling WhatsApp: ${missing.join(', ')}`,
        );
      }
    }

    const data = {
      enabled: dto.enabled ?? existing.enabled,
      phoneNumberId: dto.phoneNumberId ?? existing.phoneNumberId,
      businessAccountId: dto.businessAccountId ?? existing.businessAccountId,
      webhookVerifyToken: dto.webhookVerifyToken ?? existing.webhookVerifyToken,
      defaultCountryCode: dto.defaultCountryCode ?? existing.defaultCountryCode,
      lastUpdatedAt: new Date(),
    } as any;

    if (dto.accessToken) {
      data.accessToken = dto.accessToken;
    }

    const wasEnabled = existing.enabled;

    const updated = await this.prisma.whatsAppSettings.update({
      where: { id: existing.id },
      data,
    });

    if (!wasEnabled && updated.enabled) {
      this.logger.log('WhatsApp integration enabled');
    }

    return this.sanitizeSettings(updated);
  }

  async sendTestMessage(dto: SendTestMessageDto) {
    const message = dto.message || 'Test message from Della Café WhatsApp integration.';
    await this.sendWhatsAppMessage({
      to: dto.testPhone,
      type: 'text',
      text: message,
    });
    return { success: true };
  }

  async sendWhatsAppMessage(params: SendWhatsAppMessageParams) {
    const settings = await this.getSettings();

    if (!settings.enabled) {
      throw new BadRequestException('WhatsApp messaging is disabled.');
    }

    if (!settings.phoneNumberId || !settings.accessToken) {
      throw new BadRequestException('WhatsApp configuration is incomplete.');
    }

    const recipient = this.normalizePhoneNumber(params.to, settings.defaultCountryCode || undefined);
    if (!recipient) {
      throw new BadRequestException('Invalid recipient phone number.');
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${settings.phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${settings.accessToken}`,
      'Content-Type': 'application/json',
    };

    const payload = this.buildPayload(params, recipient) as Prisma.InputJsonValue;

    try {
      const response = await axios.post(url, payload, { headers });
      await this.logMessage({
        settingsId: settings.id,
        direction: WhatsAppMessageDirection.OUTBOUND,
        payload,
        statusCode: response.status,
      });
      this.logger.log(`WhatsApp message sent to ${recipient} (${params.type})`);
    } catch (error) {
      const status = error.response?.status;
      const errorPayload = error.response?.data || error.message;
      await this.logMessage({
        settingsId: settings.id,
        direction: WhatsAppMessageDirection.OUTBOUND,
        payload,
        statusCode: status,
        errorMessage:
          typeof errorPayload === 'string' ? errorPayload : JSON.stringify(errorPayload),
      });
      this.logger.error(
        `Failed to send WhatsApp message: ${status || ''} ${JSON.stringify(errorPayload)}`,
      );
      throw new BadRequestException('Failed to send WhatsApp message.');
    }
  }

  async logInboundWebhook(payload: Prisma.InputJsonValue) {
    const settings = await this.getSettings();
    await this.logMessage({
      settingsId: settings.id,
      direction: WhatsAppMessageDirection.INBOUND,
      payload,
    });
  }

  private buildPayload(params: SendWhatsAppMessageParams, to: string) {
    switch (params.type) {
      case 'text':
        if (!params.text) {
          throw new BadRequestException('Text message requires text content.');
        }
        return {
          messaging_product: 'whatsapp',
          to,
          type: 'text',
          text: { body: params.text },
        };
      case 'template':
        if (!params.templateName) {
          throw new BadRequestException('Template messages require templateName.');
        }
        return {
          messaging_product: 'whatsapp',
          to,
          type: 'template',
          template: {
            name: params.templateName,
            language: {
              code: params.templateLanguageCode || 'en_US',
            },
            components: params.templateParams
              ? [
                  {
                    type: 'body',
                    parameters: Object.values(params.templateParams).map((value) => ({
                      type: 'text',
                      text: value,
                    })),
                  },
                ]
              : undefined,
          },
        };
      case 'media':
        if (!params.mediaUrl) {
          throw new BadRequestException('Media messages require mediaUrl.');
        }
        if (params.mediaType === 'document') {
          return {
            messaging_product: 'whatsapp',
            to,
            type: 'document',
            document: {
              link: params.mediaUrl,
              caption: params.caption,
            },
          };
        }
        return {
          messaging_product: 'whatsapp',
          to,
          type: 'image',
          image: {
            link: params.mediaUrl,
            caption: params.caption || params.text,
          },
        };
      default:
        throw new BadRequestException(`Unsupported message type: ${params.type}`);
    }
  }

  private normalizePhoneNumber(phone: string, defaultCountryCode?: string | null) {
    if (!phone) return null;
    let normalized = phone.replace(/[^\d+]/g, '');
    if (normalized.startsWith('00')) {
      normalized = `+${normalized.slice(2)}`;
    }
    if (!normalized.startsWith('+')) {
      if (!defaultCountryCode) return null;
      const stripped = normalized.startsWith('0') ? normalized.slice(1) : normalized;
      normalized = `${defaultCountryCode}${stripped}`;
    }
    return normalized;
  }

  private maskToken(token: string) {
    if (!token) return null;
    if (token.length <= 6) {
      return `${'*'.repeat(token.length - 1)}${token.slice(-1)}`;
    }
    return `${token.slice(0, 3)}****${token.slice(-3)}`;
  }

  private async logMessage({
    settingsId,
    direction,
    payload,
    statusCode,
    errorMessage,
  }: {
    settingsId: string;
    direction: WhatsAppMessageDirection;
    payload: Prisma.InputJsonValue;
    statusCode?: number;
    errorMessage?: string;
  }) {
    await this.prisma.whatsAppLog.create({
      data: {
        direction,
        payload,
        statusCode,
        errorMessage,
        whatsAppSettingsId: settingsId,
      },
    });
  }
}
