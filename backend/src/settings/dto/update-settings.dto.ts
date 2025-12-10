import { IsString, IsOptional, IsBoolean, IsEnum, IsDecimal } from 'class-validator';
import { Language } from '@prisma/client';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessNameId?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsString()
  businessWhatsApp?: string;

  @IsOptional()
  @IsString()
  businessEmail?: string;

  @IsOptional()
  latitude?: number;

  @IsOptional()
  longitude?: number;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  ogImageUrl?: string;

  @IsOptional()
  @IsString()
  themeColor?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankAccountHolder?: string;

  @IsOptional()
  @IsString()
  bankAccountNumber?: string;

  @IsOptional()
  @IsString()
  bankPaymentInstructions?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsEnum(Language)
  defaultLanguage?: Language;

  @IsOptional()
  @IsBoolean()
  enableEnglish?: boolean;

  @IsOptional()
  @IsBoolean()
  enableIndonesian?: boolean;

  @IsOptional()
  taxRate?: number;

  @IsOptional()
  serviceChargeRate?: number;

  @IsOptional()
  @IsString()
  orderApprovalMode?: string;

  @IsOptional()
  autoClearUnapprovedMinutes?: number;

  @IsOptional()
  @IsBoolean()
  autoClearingEnabled?: boolean;

  @IsOptional()
  normalOrderClearHours?: number;

  @IsOptional()
  cakeOrderClearDays?: number;

  @IsOptional()
  cakeDownPaymentPercentage?: number;

  @IsOptional()
  @IsBoolean()
  enableCabinetFoods?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;
}
