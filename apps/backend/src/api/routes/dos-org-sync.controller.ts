import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { createHmac, timingSafeEqual } from 'crypto';
import { OrganizationService } from '@gitroom/nestjs-libraries/database/prisma/organizations/organization.service';
import { UsersService } from '@gitroom/nestjs-libraries/database/prisma/users/users.service';
import { isEcosystemSyncEnabled } from '@gitroom/helpers/utils/ecosystem.config';
import {
  DosOrgSyncDto,
  DosSyncEvent,
} from '@gitroom/nestjs-libraries/dtos/webhooks/dos-org-sync.dto';
import { makeId } from '@gitroom/nestjs-libraries/services/make.is';

@ApiTags('Webhooks')
@Controller('/webhooks')
export class DosOrgSyncWebhookController {
  constructor(
    private _orgService: OrganizationService,
    private _userService: UsersService
  ) {}

  private verifySignature(rawBody: string, signatureHeader?: string): boolean {
    if (!isEcosystemSyncEnabled()) {
      return false;
    }

    const secret =
      process.env.DOS_SYNC_WEBHOOK_SECRET ||
      process.env.DOS_WEBHOOK_SECRET ||
      process.env.JWT_SECRET;
    if (!secret || !signatureHeader) {
      return false;
    }

    const cleanSignature = signatureHeader.replace(/^sha256=/, '').trim();
    const expected = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (cleanSignature.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(cleanSignature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  }

  @Post('/dos-org-sync')
  @HttpCode(200)
  async handleSync(
    @Req() req: Request,
    @Body() payload: DosOrgSyncDto,
    @Headers('x-dos-signature') signature?: string
  ) {
    const rawBody =
      (req as any).rawBody ||
      (typeof req.body === 'string' ? req.body : JSON.stringify(payload));
    if (!this.verifySignature(rawBody, signature)) {
      throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
    }

    const { event, data } = payload;
    const { org_id, org_name, user_id, user_email, user_name, role } = data || {};

    let targetOrg = org_id ? await this._orgService.getOrgById(org_id) : null;
    if (!targetOrg && org_name) {
      targetOrg = await this._orgService.findOrgByName(org_name);
    }

    let targetUser = user_id
      ? await this._userService.getUserById(user_id)
      : null;

    if (!targetUser && user_email) {
      targetUser = await this._userService.getUserByEmail(user_email);
    }

    switch (event) {
      case DosSyncEvent.ORG_CREATED:
      case DosSyncEvent.ORGANIZATION_CREATED: {
        if (!targetOrg) {
          if (targetUser) {
            await this._orgService.createOrgForExistingUser(
              targetUser.id,
              org_name || 'Organization',
              'SUPERADMIN',
              org_id
            );
          } else if (user_email) {
            const created = await this._orgService.createOrgAndUser(
              {
                company: org_name || 'Organization',
                email: user_email,
                password: '',
                provider: 'LOCAL',
                providerId: user_id || '',
                datafast_visitor_id: '',
              },
              '127.0.0.1',
              'dos-webhook-sync'
            );
            if (user_name) {
              await this._userService.changePersonal(
                created.users[0].user.id,
                { fullname: user_name, bio: '' }
              );
            }
          }
        }
        return { success: true, event, status: 'processed' };
      }

      case DosSyncEvent.ORG_UPDATED:
      case DosSyncEvent.ORGANIZATION_UPDATED: {
        if (targetOrg && org_name) {
          await this._orgService.updateOrganizationName(targetOrg.id, org_name);
        }
        return { success: true, event, status: 'processed' };
      }

      case DosSyncEvent.ORG_DELETED:
      case DosSyncEvent.ORGANIZATION_DELETED: {
        if (targetOrg) {
          await this._orgService.deleteOrganization(targetOrg.id);
        }
        return { success: true, event, status: 'processed' };
      }

      case DosSyncEvent.ORG_MEMBER_ADDED:
      case DosSyncEvent.ORGANIZATION_MEMBER_ADDED: {
        if (targetOrg && targetUser) {
          const appRole = role === 'MEMBER' ? 'USER' : 'ADMIN';
          await this._orgService.addUserToOrg(
            targetUser.id,
            makeId(5),
            targetOrg.id,
            appRole
          );
        } else if (targetOrg && !targetUser && user_email) {
          const existingUser = await this._userService.getUserByEmail(user_email);
          if (!existingUser) {
            const created = await this._orgService.createOrgAndUser(
              {
                company: `${user_email.split('@')[0]}'s Personal`,
                email: user_email,
                password: '',
                provider: 'LOCAL',
                providerId: user_id || '',
                datafast_visitor_id: '',
              },
              '127.0.0.1',
              'dos-webhook-sync'
            );
            if (user_name) {
              await this._userService.changePersonal(
                created.users[0].user.id,
                { fullname: user_name, bio: '' }
              );
            }
            const appRole = role === 'MEMBER' ? 'USER' : 'ADMIN';
            await this._orgService.addUserToOrg(
              created.users[0].user.id,
              makeId(5),
              targetOrg.id,
              appRole
            );
          }
        }
        return { success: true, event, status: 'processed' };
      }

      case DosSyncEvent.ORG_MEMBER_REMOVED:
      case DosSyncEvent.ORGANIZATION_MEMBER_REMOVED: {
        if (targetOrg && targetUser) {
          await this._orgService.deleteTeamMember(
            targetOrg.id,
            targetUser.id
          );
        }
        return { success: true, event, status: 'processed' };
      }

      default:
        return { success: true, event, status: 'ignored' };
    }
  }
}
