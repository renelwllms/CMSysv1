import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShiftStatus } from '@prisma/client';

export class CreateShiftDto {
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsDateString()
  startDateTime: string;

  @IsDateString()
  endDateTime: string;

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
