import { IsEnum } from 'class-validator';
import { StaffStatus } from '@prisma/client';

export class UpdateStaffStatusDto {
  @IsEnum(StaffStatus)
  status: StaffStatus;
}
