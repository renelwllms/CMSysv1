import { IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

const PAY_TYPES = ['HOURLY', 'DAILY', 'SALARY'] as const;
const WEEK_START_DAYS = ['MON', 'SUN'] as const;
const OVERLAP_RULES = ['ALLOW', 'WARN', 'BLOCK'] as const;
const ROSTER_VISIBILITY = ['OWN', 'ALL'] as const;
const GRANULARITY_VALUES = [15, 30, 60] as const;

export class UpdateStaffSettingsDto {
  @IsOptional()
  @IsBoolean()
  staffModuleEnabled?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @IsIn(PAY_TYPES, { each: true })
  payTypeOptionsEnabled?: string[];

  @IsOptional()
  @IsIn(PAY_TYPES)
  defaultPayType?: (typeof PAY_TYPES)[number];

  @IsOptional()
  @IsIn(WEEK_START_DAYS)
  weekStartDay?: (typeof WEEK_START_DAYS)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn(GRANULARITY_VALUES)
  shiftTimeGranularity?: number;

  @IsOptional()
  @IsIn(OVERLAP_RULES)
  overlapRule?: (typeof OVERLAP_RULES)[number];

  @IsOptional()
  @IsIn(ROSTER_VISIBILITY)
  rosterVisibility?: (typeof ROSTER_VISIBILITY)[number];
}
