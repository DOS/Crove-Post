import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Get,
  Header,
  HttpCode,
  Injectable,
  Post,
  Query,
  RawBodyRequest,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { sign } from 'jsonwebtoken';
import { FirstPartyBootstrapService } from '@gitroom/backend/ecosystem/first-party-bootstrap.service';

@Injectable()
export class FirstPartyBootstrapGuard implements CanActivate {
  constructor(private readonly bootstrap: FirstPartyBootstrapService) {}
  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    await this.bootstrap.authenticate(request.headers, request.rawBody);
    return true;
  }
}

// Nginx strips /api from public requests before forwarding to NestJS.
@Controller('/internal/first-party')
export class FirstPartyBootstrapController {
  constructor(private readonly bootstrap: FirstPartyBootstrapService) {}

  @Post('/bootstrap')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(FirstPartyBootstrapGuard)
  bootstrapSession(@Body() body: unknown) {
    return this.bootstrap.bootstrap(body);
  }

  @Get('/launch')
  async launch(@Query('ticket') ticket: unknown, @Res() response: Response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    const session = await this.bootstrap.consume(ticket);
    // Host-only cookies isolate Beta from production. Never return a session JWT.
    const cookie = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 86_400_000,
    };
    response.cookie(
      '__Host-crove-auth',
      sign({ id: session.user.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d',
      }),
      cookie
    );
    response.cookie('__Host-crove-org', session.organizationId, cookie);
    return response.redirect(303, session.redirect);
  }
}
