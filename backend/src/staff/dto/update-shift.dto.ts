import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftStatus } from '@prisma/client';

export class UpdateShiftDto {
  @IsOptional()
  @IsString()
  staffId?: string;

  @IsOptional()
  @IsDateString()
  startDateTime?: string;

  @IsOptional()
  @IsDateString()
  endDateTime?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  breakMinutes?: number;

  @IsOptional()
  @IsString()
  roleOnShiftId?: string;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
