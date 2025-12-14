import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

export interface RequestTenant {
  id: string;
  slug: string;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(private prisma: PrismaService) {}

  async resolveTenant(req: Request): Promise<RequestTenant> {
    const slug =
      (req.headers['x-tenant-id'] as string) ||
      (req.query?.tenant as string) ||
      this.extractSlugFromHost(req.headers.host) ||
      process.env.DEFAULT_TENANT_SLUG ||
      'default';

    const tenant = await this.prisma.tenant.upsert({
      where: { slug },
      create: {
        name: this.buildTenantName(slug),
        slug,
        isActive: true,
      },
      update: {},
    });

    return { id: tenant.id, slug: tenant.slug };
  }

  private extractSlugFromHost(host?: string | null): string | undefined {
    if (!host) return undefined;
    const cleanHost = host.split(':')[0];
    const baseDomain = process.env.TENANT_BASE_DOMAIN;
    if (baseDomain && cleanHost.endsWith(baseDomain)) {
      const parts = cleanHost.replace(`.${baseDomain}`, '').split('.');
      const subdomain = parts[0];
      if (subdomain && subdomain !== 'www') {
        return subdomain.toLowerCase();
      }
    }
    return undefined;
  }

  private buildTenantName(slug: string) {
    const readable = slug.replace(/[-_]+/g, ' ');
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  }
}
