import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import { AuthService as AuthChecker } from '@gitroom/helpers/auth/auth.service';
import { getCookieUrlFromDomain } from '@gitroom/helpers/subdomain/subdomain.management';
import { isEcosystemSyncEnabled } from '@gitroom/helpers/utils/ecosystem.config';
import { ProvisionUserDto } from '@gitroom/nestjs-libraries/dtos/provision/provision-user.dto';
import { ConsumeTicketDto } from '@gitroom/nestjs-libraries/dtos/provision/consume-ticket.dto';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';
import { ioRedis } from '@gitroom/nestjs-libraries/redis/redis.service';
import { Provider } from '@prisma/client';

@ApiTags('Provisioning')
@Controller('/v1')
export class ProvisionController {
  constructor(
    private _orgService: OrganizationService,
    private _userService: UsersService,
    private _authService: AuthService
  ) {}

  private verifyAuth(authHeader?: string): boolean {
    if (!isEcosystemSyncEnabled()) {
      return false;
    }

    const secret =
      process.env.PROVISIONING_SECRET_KEY ||
      process.env.DOS_PROVISIONING_SECRET ||
      process.env.DOS_SYNC_WEBHOOK_SECRET ||
      process.env.INTERNAL_API_KEY;

    if (!secret || !authHeader) {
      return false;
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return false;
    }

    const expected = Buffer.from(secret);
    const provided = Buffer.from(token);
    if (expected.length !== provided.length) {
      return false;
    }

    return timingSafeEqual(provided, expected);
  }

  @Post('/provision')
  @HttpCode(200)
  async provision(
    @Body() body: ProvisionUserDto,
    @Headers('authorization') authHeader?: string
  ) {
    if (!this.verifyAuth(authHeader)) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const { userId, email, name, orgId, orgName, role } = body;

    // 1. Find or create user
    let user = await this._userService.getUserByProvider(userId, Provider.GENERIC);
    if (!user && email) {
      user = await this._userService.getUserByEmail(email);
    }

    let targetOrg: any = null;
    if (orgId) {
      targetOrg = await this._orgService.getOrgById(orgId);
    }

    const effectiveOrgName =
      orgName || (name ? `${name}'s Workspace` : `${email.split('@')[0]} Workspace`);

    if (!user) {
      // Create user and initial organization
      const created = await this._orgService.createOrgAndUser(
        {
          company: effectiveOrgName,
          email,
          password: '',
          provider: 'GENERIC',
          providerId: userId,
          datafast_visitor_id: '',
        },
        '127.0.0.1',
        'headless-provisioning'
      );
      user = created.users[0].user;
      targetOrg = created;

      if (name) {
        await this._userService.changePersonal(user.id, {
          fullname: name,
          bio: '',
        });
      }
    } else {
      if (name && user.name !== name) {
        await this._userService.changePersonal(user.id, {
          fullname: name,
          bio: user.bio || '',
        });
      }
    }

    // 2. Ensure organization exists and user is assigned
    if (orgId) {
      if (!targetOrg) {
        targetOrg = await this._orgService.createOrgForExistingUser(
          user.id,
          effectiveOrgName,
          role || 'SUPERADMIN',
          orgId
        );
      } else {
        const userOrgs = await this._orgService.getOrgsByUserId(user.id);
        const inOrg = userOrgs.some((o) => o.id === targetOrg.id);
        if (!inOrg) {
          const appRole = role === 'USER' ? 'USER' : 'ADMIN';
          await this._orgService.addUserToOrg(
            user.id,
            makeId(5),
            targetOrg.id,
            appRole
          );
        }
      }
    }

    if (!targetOrg) {
      const userOrgs = await this._orgService.getOrgsByUserId(user.id);
      targetOrg = userOrgs[0] || { id: orgId || makeId(10), name: effectiveOrgName };
    }

    // 3. Issue one-time login ticket (single-use, valid for 5 minutes)
    const ticketId = makeId(32);
    const ticket = AuthChecker.signJWT({
      jti: ticketId,
      userId: user.id,
      orgId: targetOrg.id,
      type: 'one_time_ticket',
      exp: Math.floor(Date.now() / 1000) + 300,
    });

    // Store in Redis with 300s TTL for single-use / replay protection
    await ioRedis.set(
      `ticket:${ticketId}`,
      JSON.stringify({ userId: user.id, orgId: targetOrg.id }),
      'EX',
      300
    );

    const loginUrl = `${process.env.FRONTEND_URL}/auth/ticket?ticket=${ticket}`;

    return {
      success: true,
      ticket,
      loginUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      organization: {
        id: targetOrg.id,
        name: targetOrg.name,
      },
    };
  }

  @Post('/ticket/consume')
  @HttpCode(200)
  async consumeTicket(
    @Body() body: ConsumeTicketDto,
    @Res({ passthrough: false }) response: Response
  ) {
    if (!body?.ticket) {
      throw new HttpException('Ticket is required', HttpStatus.BAD_REQUEST);
    }

    let payload: any;
    try {
      payload = AuthChecker.verifyJWT(body.ticket);
    } catch (e) {
      throw new HttpException('Invalid or expired ticket', HttpStatus.BAD_REQUEST);
    }

    if (payload?.type !== 'one_time_ticket' || !payload?.userId || !payload?.jti) {
      throw new HttpException('Invalid ticket type', HttpStatus.BAD_REQUEST);
    }

    // Atomic consume & replay protection: verify ticket exists and delete in single atomic Redis transaction (Lua)
    const ticketKey = `ticket:${payload.jti}`;
    const luaScript = `
      local val = redis.call('GET', KEYS[1])
      if val then
        redis.call('DEL', KEYS[1])
        return val
      else
        return nil
      end
    `;
    const storedTicket = (await ioRedis.eval(luaScript, 1, ticketKey)) as string | null;
    if (!storedTicket) {
      throw new HttpException(
        'Ticket has already been used or has expired',
        HttpStatus.BAD_REQUEST
      );
    }

    const user = await this._userService.getUserById(payload.userId);
    if (!user || !user.activated) {
      throw new HttpException('User not found or inactive', HttpStatus.NOT_FOUND);
    }

    const jwt = await this._authService.jwt(user);

    // A legacy ticket explicitly replaces any prior first-party host session.
    for (const name of ['__Host-crove-auth', '__Host-crove-org']) {
      response.clearCookie(name, { path: '/', secure: true, httpOnly: true, sameSite: 'lax' });
    }

    response.cookie('auth', jwt, {
      domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
      ...(!process.env.NOT_SECURED
        ? {
            secure: true,
            httpOnly: true,
            sameSite: 'none',
          }
        : {}),
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
    });

    if (payload.orgId) {
      response.cookie('showorg', payload.orgId, {
        domain: getCookieUrlFromDomain(process.env.FRONTEND_URL!),
        ...(!process.env.NOT_SECURED
          ? {
              secure: true,
              httpOnly: true,
              sameSite: 'none',
            }
          : {}),
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
      });
    }

    if (process.env.NOT_SECURED) {
      response.header('auth', jwt);
      if (payload.orgId) response.header('showorg', payload.orgId);
    }

    return response.json({
      success: true,
      jwt,
      userId: user.id,
      orgId: payload.orgId,
      redirect_to: body.redirect_to || '/',
    });
  }
}
