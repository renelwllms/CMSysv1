import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { ShiftStatus, StaffStatus, UserRole } from '@prisma/client';

interface ShiftFilters {
  from?: string;
  to?: string;
  staffId?: string;
  roleId?: string;
}

@Injectable()
export class ShiftsService {
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

  private parseDate(value: string, endOfDay = false) {
    const suffix = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
    const parsed = new Date(`${value}${suffix}`);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }
    return parsed;
  }

  private buildDateRange(from?: string, to?: string) {
    if (!from && !to) return {};

    const start = from ? this.parseDate(from, false) : undefined;
    const end = to ? this.parseDate(to, true) : undefined;

    if (start && end && start > end) {
      throw new BadRequestException('From date must be before to date.');
    }

    return { start, end };
  }

  private formatDateKey(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private ensureGranularity(date: Date, granularity: number) {
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    if (seconds !== 0 || minutes % granularity !== 0) {
      throw new BadRequestException(`Shift times must align to ${granularity}-minute increments.`);
    }
  }

  private async getStaffIdForUser(user: any) {
    const staff = await this.prisma.staff.findFirst({
      where: {
        email: user?.email,
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff profile not found for this user.');
    }

    return staff.id;
  }

  private async checkOverlap(
    staffId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeId?: string,
  ) {
    return this.prisma.shift.findMany({
      where: {
        staffId,
        ...(excludeId ? { id: { not: excludeId } } : {}),
        status: { not: ShiftStatus.CANCELLED },
        startDateTime: { lt: endDateTime },
        endDateTime: { gt: startDateTime },
      },
    });
  }

  async findAll(filters: ShiftFilters, user: any) {
    const settings = await this.assertModuleEnabled();
    const { start, end } = this.buildDateRange(filters.from, filters.to);

    const where: any = {};

    if (start || end) {
      where.startDateTime = {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      };
    }

    if (filters.roleId) {
      where.roleOnShiftId = filters.roleId;
    }

    if (user?.role === UserRole.STAFF) {
      if (settings.rosterVisibility !== 'ALL') {
        where.staffId = await this.getStaffIdForUser(user);
      }
      where.status = ShiftStatus.PUBLISHED;
    } else if (filters.staffId) {
      where.staffId = filters.staffId;
    }

    return this.prisma.shift.findMany({
      where,
      include: {
        staff: {
          include: { jobRoles: { include: { jobRole: true } } },
        },
        roleOnShift: true,
      },
      orderBy: { startDateTime: 'asc' },
    });
  }

  async create(dto: CreateShiftDto, user: any) {
    const settings = await this.assertModuleEnabled();

    const staff = await this.prisma.staff.findFirst({
      where: {
        id: dto.staffId,
        status: { not: StaffStatus.INACTIVE },
      },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found or inactive.');
    }

    if (dto.roleOnShiftId) {
      const role = await this.prisma.jobRole.findFirst({
        where: {
          id: dto.roleOnShiftId,
        },
      });
      if (!role) {
        throw new NotFoundException('Role on shift not found.');
      }
    }

    const start = new Date(dto.startDateTime);
    const end = new Date(dto.endDateTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    if (end <= start) {
      throw new BadRequestException('endDateTime must be after startDateTime.');
    }

    this.ensureGranularity(start, settings.shiftTimeGranularity);
    this.ensureGranularity(end, settings.shiftTimeGranularity);

    const overlaps = await this.checkOverlap(dto.staffId, start, end);
    if (overlaps.length && settings.overlapRule === 'BLOCK') {
      throw new BadRequestException('Shift overlaps with an existing shift.');
    }

    const shift = await this.prisma.shift.create({
      data: {
        staffId: dto.staffId,
        startDateTime: start,
        endDateTime: end,
        breakMinutes: dto.breakMinutes ?? 0,
        roleOnShiftId: dto.roleOnShiftId,
        status: dto.status ?? ShiftStatus.SCHEDULED,
        notes: dto.notes,
        createdBy: user?.id,
      },
      include: {
        staff: {
          include: { jobRoles: { include: { jobRole: true } } },
        },
        roleOnShift: true,
      },
    });

    return {
      shift,
      warning: overlaps.length && settings.overlapRule === 'WARN' ? 'Shift overlaps with an existing shift.' : undefined,
    };
  }

  async update(id: string, dto: UpdateShiftDto, user: any) {
    const settings = await this.assertModuleEnabled();

    const existing = await this.prisma.shift.findFirst({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Shift not found');
    }

    const staffId = dto.staffId ?? existing.staffId;
    const start = dto.startDateTime ? new Date(dto.startDateTime) : existing.startDateTime;
    const end = dto.endDateTime ? new Date(dto.endDateTime) : existing.endDateTime;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format.');
    }

    if (end <= start) {
      throw new BadRequestException('endDateTime must be after startDateTime.');
    }

    this.ensureGranularity(start, settings.shiftTimeGranularity);
    this.ensureGranularity(end, settings.shiftTimeGranularity);

    if (dto.staffId) {
      const staff = await this.prisma.staff.findFirst({
        where: {
          id: staffId,
          status: { not: StaffStatus.INACTIVE },
        },
      });
      if (!staff) {
        throw new NotFoundException('Staff member not found or inactive.');
      }
    }

    if (dto.roleOnShiftId) {
      const role = await this.prisma.jobRole.findFirst({
        where: {
          id: dto.roleOnShiftId,
        },
      });
      if (!role) {
        throw new NotFoundException('Role on shift not found.');
      }
    }

    const overlaps = await this.checkOverlap(staffId, start, end, existing.id);
    if (overlaps.length && settings.overlapRule === 'BLOCK') {
      throw new BadRequestException('Shift overlaps with an existing shift.');
    }

    const shift = await this.prisma.shift.update({
      where: { id: existing.id },
      data: {
        staffId,
        startDateTime: start,
        endDateTime: end,
        breakMinutes: dto.breakMinutes,
        roleOnShiftId: dto.roleOnShiftId,
        status: dto.status,
        notes: dto.notes,
      },
      include: {
        staff: {
          include: { jobRoles: { include: { jobRole: true } } },
        },
        roleOnShift: true,
      },
    });

    return {
      shift,
      warning: overlaps.length && settings.overlapRule === 'WARN' ? 'Shift overlaps with an existing shift.' : undefined,
    };
  }

  async cancel(id: string) {
    await this.assertModuleEnabled();

    const existing = await this.prisma.shift.findFirst({
      where: {
        id,
      },
    });

    if (!existing) {
      throw new NotFoundException('Shift not found');
    }

    return this.prisma.shift.update({
      where: { id: existing.id },
      data: { status: ShiftStatus.CANCELLED },
      include: {
        staff: {
          include: { jobRoles: { include: { jobRole: true } } },
        },
        roleOnShift: true,
      },
    });
  }

  async publish(from: string, to: string) {
    await this.assertModuleEnabled();
    const { start, end } = this.buildDateRange(from, to);

    if (!start || !end) {
      throw new BadRequestException('from and to dates are required.');
    }

    return this.prisma.shift.updateMany({
      where: {
        startDateTime: {
          gte: start,
          lte: end,
        },
        status: ShiftStatus.SCHEDULED,
      },
      data: { status: ShiftStatus.PUBLISHED },
    });
  }

  async summary(from?: string, to?: string, date?: string) {
    await this.assertModuleEnabled();

    const rangeFrom = date ?? from;
    const rangeTo = date ?? to ?? date;
    const { start, end } = this.buildDateRange(rangeFrom, rangeTo);

    if (!start || !end) {
      throw new BadRequestException('date or from/to query parameters are required.');
    }

    const shifts = await this.prisma.shift.findMany({
      where: {
        startDateTime: { gte: start, lte: end },
        status: { not: ShiftStatus.CANCELLED },
      },
      include: { roleOnShift: true },
    });

    const summaryMap = new Map<string, { staffIds: Set<string>; roleCounts: Record<string, number> }>();

    for (const shift of shifts) {
      const key = this.formatDateKey(shift.startDateTime);
      if (!summaryMap.has(key)) {
        summaryMap.set(key, { staffIds: new Set(), roleCounts: {} });
      }

      const entry = summaryMap.get(key)!;
      entry.staffIds.add(shift.staffId);
      if (shift.roleOnShift?.name) {
        entry.roleCounts[shift.roleOnShift.name] = (entry.roleCounts[shift.roleOnShift.name] || 0) + 1;
      }
    }

    return Array.from(summaryMap.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([day, data]) => ({
        date: day,
        staffCount: data.staffIds.size,
        roleCounts: data.roleCounts,
      }));
  }
}
