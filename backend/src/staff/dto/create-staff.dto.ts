import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  IsEmail,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StaffPayType, StaffStatus, UserRole } from '@prisma/client';

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(StaffStatus)
  status?: StaffStatus;

  @IsOptional()
  @IsEnum(UserRole)
  systemRole?: UserRole;

  @IsOptional()
  @IsEnum(StaffPayType)
  payType?: StaffPayType;

  @ValidateIf((o) => o.payType === StaffPayType.HOURLY)
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  hourlyRate?: number;

  @ValidateIf((o) => o.payType === StaffPayType.DAILY)
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  dailyRate?: number;

  @ValidateIf((o) => o.payType === StaffPayType.SALARY)
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  salaryRate?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  jobRoleIds?: string[];
}
