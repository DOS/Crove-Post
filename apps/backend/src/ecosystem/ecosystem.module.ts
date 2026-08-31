import { Module } from '@nestjs/common';
import { DosOrgSyncWebhookController } from '@gitroom/backend/api/routes/dos-org-sync.controller';
import { ProvisionController } from '@gitroom/backend/api/routes/provision.controller';
import { EcosystemService } from '@gitroom/backend/ecosystem/ecosystem.service';
import { AuthService } from '@gitroom/backend/services/auth/auth.service';

@Module({
  controllers: [DosOrgSyncWebhookController, ProvisionController],
  providers: [EcosystemService, AuthService],
  exports: [EcosystemService],
})
export class EcosystemModule {}
