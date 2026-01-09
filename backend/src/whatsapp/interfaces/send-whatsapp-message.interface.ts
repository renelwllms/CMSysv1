export type WhatsAppMessageType = 'text' | 'template' | 'media';

export interface SendWhatsAppMessageParams {
  to: string;
  type: WhatsAppMessageType;
  text?: string;
  templateName?: string;
  templateParams?: Record<string, string>;
  templateLanguageCode?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'document';
  caption?: string;
}
