import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDecimal,
  IsNumber,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
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
  @Type(() => Number)
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  serviceChargeRate?: number;

  @IsOptional()
  @IsString()
  orderApprovalMode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  autoClearUnapprovedMinutes?: number;

  @IsOptional()
  @IsBoolean()
  autoClearingEnabled?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  normalOrderClearHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cakeOrderClearDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cakeDownPaymentPercentage?: number;

  @IsOptional()
  @IsBoolean()
  enableCabinetFoods?: boolean;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  upsellItemIds?: string[];
}
