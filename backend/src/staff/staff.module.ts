import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';
import { JobRolesController } from './job-roles.controller';
import { JobRolesService } from './job-roles.service';
import { ShiftsController } from './shifts.controller';
import { ShiftsService } from './shifts.service';

@Module({
  imports: [PrismaModule],
  controllers: [StaffController, JobRolesController, ShiftsController],
  providers: [StaffService, JobRolesService, ShiftsService],
})
export class StaffModule {}
