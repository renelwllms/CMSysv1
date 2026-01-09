import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobRoleDto } from './dto/create-job-role.dto';

@Injectable()
export class JobRolesService {
  constructor(private prisma: PrismaService) {}

  private async getSettings() {
    let settings = await this.prisma.settings.findFirst();

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: {},
      });
    }

    return settings;
  }

  private async assertModuleEnabled() {
    const settings = await this.getSettings();
    if (!settings.staffModuleEnabled) {
      throw new ForbiddenException('Staff module is disabled.');
    }
  }

  async findAll() {
    await this.assertModuleEnabled();
    return this.prisma.jobRole.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateJobRoleDto) {
    await this.assertModuleEnabled();
    return this.prisma.jobRole.create({
      data: {
        name: dto.name.trim(),
      },
    });
  }

  async remove(id: string) {
    await this.assertModuleEnabled();

    const role = await this.prisma.jobRole.findFirst({
      where: {
        id,
      },
    });

    if (!role) {
      throw new NotFoundException('Job role not found');
    }

    const [assignedStaffCount, assignedShiftCount] = await Promise.all([
      this.prisma.staffJobRole.count({
        where: {
          jobRoleId: id,
        },
      }),
      this.prisma.shift.count({
        where: {
          roleOnShiftId: id,
        },
      }),
    ]);

    if (assignedStaffCount > 0 || assignedShiftCount > 0) {
      throw new BadRequestException('Job role is in use and cannot be deleted.');
    }

    return this.prisma.jobRole.delete({
      where: { id },
    });
  }
}
