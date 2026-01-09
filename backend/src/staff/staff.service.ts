import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffPayType, StaffStatus, UserRole } from '@prisma/client';

@Injectable()
export class StaffService {
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
    return settings;
  }

  private ensureSystemRole(role?: UserRole) {
    if (role === UserRole.KITCHEN) {
      throw new BadRequestException('System role cannot be KITCHEN for staff records.');
    }
  }

  private resolvePayType(
    inputPayType: StaffPayType | undefined,
    enabledPayTypes: string[],
    defaultPayType: string,
  ) {
    if (!inputPayType) {
      if (enabledPayTypes.includes(defaultPayType)) {
        return defaultPayType as StaffPayType;
      }
      return enabledPayTypes[0] as StaffPayType | undefined;
    }

    if (!enabledPayTypes.includes(inputPayType)) {
      throw new BadRequestException('Selected pay type is not enabled in settings.');
    }

    return inputPayType;
  }

  private validateRates(
    payType?: StaffPayType,
    dto?: CreateStaffDto | UpdateStaffDto,
    existingRates?: { hourlyRate?: number | null; dailyRate?: number | null; salaryRate?: number | null },
  ) {
    if (!payType) return;

    const hourlyRate = dto?.hourlyRate ?? existingRates?.hourlyRate;
    const dailyRate = dto?.dailyRate ?? existingRates?.dailyRate;
    const salaryRate = dto?.salaryRate ?? existingRates?.salaryRate;

    if (payType === StaffPayType.HOURLY && (hourlyRate === undefined || hourlyRate === null)) {
      throw new BadRequestException('Hourly rate is required for hourly pay type.');
    }
    if (payType === StaffPayType.DAILY && (dailyRate === undefined || dailyRate === null)) {
      throw new BadRequestException('Daily rate is required for daily pay type.');
    }
    if (payType === StaffPayType.SALARY && (salaryRate === undefined || salaryRate === null)) {
      throw new BadRequestException('Salary rate is required for salary pay type.');
    }
  }

  async findAll(status?: StaffStatus) {
    await this.assertModuleEnabled();
    return this.prisma.staff.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      include: {
        jobRoles: {
          include: {
            jobRole: true,
          },
        },
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  }

  async findById(id: string) {
    await this.assertModuleEnabled();
    const staff = await this.prisma.staff.findFirst({
      where: {
        id,
      },
      include: {
        jobRoles: { include: { jobRole: true } },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  async findByUserEmail(email: string) {
    await this.assertModuleEnabled();
    if (!email) {
      throw new BadRequestException('User email is required to resolve staff profile.');
    }

    const staff = await this.prisma.staff.findFirst({
      where: {
        email,
      },
      include: { jobRoles: { include: { jobRole: true } } },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found');
    }

    return staff;
  }

  async create(dto: CreateStaffDto) {
    const settings = await this.assertModuleEnabled();
    this.ensureSystemRole(dto.systemRole);

    const enabledPayTypes = settings.payTypeOptionsEnabled || [];
    const resolvedPayType = this.resolvePayType(dto.payType, enabledPayTypes, settings.defaultPayType);
    this.validateRates(resolvedPayType, dto);

    const jobRoleIds = dto.jobRoleIds ? Array.from(new Set(dto.jobRoleIds)) : [];
    if (jobRoleIds.length) {
      const count = await this.prisma.jobRole.count({
        where: {
          id: { in: jobRoleIds },
        },
      });
      if (count !== jobRoleIds.length) {
        throw new BadRequestException('One or more job roles were not found.');
      }
    }

    return this.prisma.staff.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName,
        phone: dto.phone,
        email: dto.email,
        status: dto.status ?? StaffStatus.ACTIVE,
        systemRole: dto.systemRole ?? UserRole.STAFF,
        payType: resolvedPayType,
        hourlyRate: dto.hourlyRate,
        dailyRate: dto.dailyRate,
        salaryRate: dto.salaryRate,
        notes: dto.notes,
        jobRoles: jobRoleIds.length
          ? {
              create: jobRoleIds.map((jobRoleId) => ({ jobRoleId })),
            }
          : undefined,
      },
      include: {
        jobRoles: { include: { jobRole: true } },
      },
    });
  }

  async update(id: string, dto: UpdateStaffDto) {
    const settings = await this.assertModuleEnabled();

    const existing = await this.prisma.staff.findFirst({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    this.ensureSystemRole(dto.systemRole ?? existing.systemRole);

    const enabledPayTypes = settings.payTypeOptionsEnabled || [];
    const resolvedPayType = dto.payType ?? existing.payType ?? undefined;
    if (dto.payType) {
      this.resolvePayType(dto.payType, enabledPayTypes, settings.defaultPayType);
    }
    this.validateRates(resolvedPayType, dto, {
      hourlyRate: existing.hourlyRate ? Number(existing.hourlyRate) : null,
      dailyRate: existing.dailyRate ? Number(existing.dailyRate) : null,
      salaryRate: existing.salaryRate ? Number(existing.salaryRate) : null,
    });

    const jobRoleIds = dto.jobRoleIds ? Array.from(new Set(dto.jobRoleIds)) : undefined;
    if (jobRoleIds && jobRoleIds.length) {
      const count = await this.prisma.jobRole.count({
        where: {
          id: { in: jobRoleIds },
        },
      });
      if (count !== jobRoleIds.length) {
        throw new BadRequestException('One or more job roles were not found.');
      }
    }

    return this.prisma.staff.update({
      where: { id: existing.id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName,
        phone: dto.phone,
        email: dto.email,
        status: dto.status,
        systemRole: dto.systemRole,
        payType: dto.payType,
        hourlyRate: dto.hourlyRate,
        dailyRate: dto.dailyRate,
        salaryRate: dto.salaryRate,
        notes: dto.notes,
        jobRoles: jobRoleIds
          ? {
              deleteMany: {},
              create: jobRoleIds.map((jobRoleId) => ({ jobRoleId })),
            }
          : undefined,
      },
      include: {
        jobRoles: { include: { jobRole: true } },
      },
    });
  }

  async updateStatus(id: string, status: StaffStatus) {
    await this.assertModuleEnabled();

    const existing = await this.prisma.staff.findFirst({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Staff member not found');
    }

    return this.prisma.staff.update({
      where: { id: existing.id },
      data: { status },
      include: { jobRoles: { include: { jobRole: true } } },
    });
  }
}
