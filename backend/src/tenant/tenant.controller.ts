import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class TenantController {
  constructor(private tenantService: TenantService) {}

  @Get()
  list() {
    return this.tenantService.listTenants();
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return this.tenantService.createTenant(dto);
  }
}
