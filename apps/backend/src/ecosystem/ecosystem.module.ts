import { Module } from '@nestjs/common';
import { DosOrgSyncWebhookController } from '@gitroom/backend/api/routes/dos-org-sync.controller';
import { ProvisionController } from '@gitroom/backend/api/routes/provision.controller';
import { EcosystemService } from '@gitroom/backend/ecosystem/ecosystem.service';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';
import {
  FirstPartyBootstrapController,
  FirstPartyBootstrapGuard,
} from '@gitroom/backend/api/routes/first-party-bootstrap.controller';
import { FirstPartyBootstrapService } from '@gitroom/backend/ecosystem/first-party-bootstrap.service';

@Module({
  controllers: [
    DosOrgSyncWebhookController,
    ProvisionController,
    FirstPartyBootstrapController,
  ],
  providers: [
    EcosystemService,
    AuthService,
    FirstPartyBootstrapService,
    FirstPartyBootstrapGuard,
  ],
  exports: [EcosystemService],
})
export class EcosystemModule {}
