import { Module } from '@nestjs/common';
import { DosOrgSyncWebhookController } from '@gitroom/backend/api/routes/dos-org-sync.controller';
import { ProvisionController } from '@gitroom/backend/api/routes/provision.controller';
import { EcosystemService } from '@gitroom/backend/ecosystem/ecosystem.service';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import {
  BootstrapController,
  BootstrapGuard,
} from '@gitroom/backend/api/routes/bootstrap.controller';
import { BootstrapService } from './bootstrap.service';
import { BootstrapRepository } from '@gitroom/nestjs-libraries/database/prisma/provision/bootstrap.repository';

@Module({
  controllers: [
    DosOrgSyncWebhookController,
    ProvisionController,
    BootstrapController,
  ],
  providers: [
    EcosystemService,
    AuthService,
    BootstrapGuard,
    BootstrapService,
    BootstrapRepository,
  ],
  exports: [EcosystemService],
})
export class EcosystemModule {}
