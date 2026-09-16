import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, Provider, Role } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { BootstrapDto } from '@gitroom/nestjs-libraries/dtos/provision/bootstrap.dto';

@Injectable()
export class BootstrapRepository {
  constructor(private readonly prisma: PrismaService) {}

  async project(body: BootstrapDto) {
    // Serializable transactions prevent concurrent identity/membership creation.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const existing = await tx.user.findUnique({
              where: { id: body.user.id },
            });
            const linked = await tx.user.findMany({
              where: {
                providerName: Provider.GENERIC,
                providerId: body.user.id,
              },
              take: 2,
            });
            if (
              linked.length > 1 ||
              (existing && linked[0] && existing.id !== linked[0].id)
            ) {
              throw new ConflictException('Identity projection conflict');
            }
            // Retain pre-existing provider-ID projections, never link by email.
            const identity = existing || linked[0];
            if (
              identity &&
              (identity.providerName !== Provider.GENERIC ||
                identity.providerId !== body.user.id ||
                identity.deletedAt ||
                !identity.activated)
            ) {
              throw new ConflictException('Identity projection conflict');
            }
            const organization = await tx.organization.findUnique({
              where: { id: body.organization.id },
            });
            if (organization?.deletedAt)
              throw new ConflictException('Organization unavailable');
            const user = await tx.user.upsert({
              where: { id: identity?.id || body.user.id },
              create: {
                id: body.user.id,
                email: body.user.email,
                name: body.user.name,
                providerName: Provider.GENERIC,
                providerId: body.user.id,
                timezone: 0,
              },
              update: { email: body.user.email, name: body.user.name },
            });
            const org = await tx.organization.upsert({
              where: { id: body.organization.id },
              create: {
                id: body.organization.id,
                name: body.organization.name,
              },
              update: { name: body.organization.name },
            });
            const role =
              body.organization.role === 'OWNER'
                ? Role.SUPERADMIN
                : body.organization.role === 'ADMIN'
                ? Role.ADMIN
                : Role.USER;
            await tx.userOrganization.upsert({
              where: {
                userId_organizationId: {
                  userId: user.id,
                  organizationId: org.id,
                },
              },
              create: { userId: user.id, organizationId: org.id, role },
              update: { role, disabled: false },
            });
            return { userId: user.id, orgId: org.id };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2034' || error.code === 'P2002')
        ) {
          if (attempt < 4) continue;
          throw new ConflictException('Identity projection conflict');
        }
        throw error;
      }
    }
  }

  async activeUser(userId: string, orgId: string) {
    const membership = await this.prisma.userOrganization.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      include: { user: true, organization: true },
    });
    return membership &&
      !membership.disabled &&
      !membership.organization.deletedAt &&
      membership.user.activated &&
      !membership.user.deletedAt
      ? membership.user
      : null;
  }
}
