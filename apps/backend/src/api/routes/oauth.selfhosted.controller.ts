import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { OAuthService } from '@gitroom/nestjs-libraries/database/prisma/oauth/oauth.service';
import { AuthorizeSelfHostedDto } from '@gitroom/nestjs-libraries/dtos/oauth/authorize-oauth.dto';
import { McpRelayService } from '@gitroom/nestjs-libraries/chat/mcp.relay.service';
import { ThrottlerRealIpGuard } from '@gitroom/nestjs-libraries/throttler/throttler.provider';

// Split out of OAuthController so the bootstrap/consent test suite (which
// imports OAuthAuthorizedController) does not pull McpRelayService - and
// through it @mastra/core and ESM-only dependencies - into its module graph.
@ApiTags('OAuth')
@Controller('/oauth')
export class OAuthSelfHostedController {
  constructor(
    private _oauthService: OAuthService,
    private _mcpRelayService: McpRelayService
  ) {}

  // Public (the person may have no account here) and capped per client,
  // since every attempt sends requests to the instance
  @UseGuards(ThrottlerRealIpGuard)
  @Throttle({ default: { limit: 30, ttl: 3600000 } })
  @Post('/authorize/self-hosted')
  async authorizeSelfHosted(@Body() body: AuthorizeSelfHostedDto) {
    const app = await this._oauthService.validateAuthorizationRequest(
      body.client_id,
      {
        redirectUri: body.redirect_uri,
        codeChallenge: body.code_challenge,
        codeChallengeMethod: body.code_challenge_method,
      }
    );

    const email = body.email?.trim();
    this._oauthService.validateSelfHostedRequest(app, {
      resource: body.resource,
      email,
    });

    const instance = await this._mcpRelayService.connect(
      body.instance_url,
      body.api_key
    );

    const code = await this._oauthService.createSelfHostedAuthorizationCode(
      app.id,
      { ...instance, email },
      app.dynamic
        ? {
            codeChallenge: body.code_challenge,
            codeChallengeMethod: body.code_challenge_method,
            redirectUri: body.redirect_uri,
          }
        : undefined
    );

    // Same redirect as an approved cloud authorization
    const redirectUrl = new URL(
      app.dynamic ? body.redirect_uri! : app.redirectUrl
    );
    redirectUrl.searchParams.set('code', code);
    if (body.state) {
      redirectUrl.searchParams.set('state', body.state);
    }
    return { redirect: redirectUrl.toString() };
  }
}
