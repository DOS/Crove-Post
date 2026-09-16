import {
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  Header,
  HttpCode,
  Injectable,
  Post,
  RawBodyRequest,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { BootstrapService } from '@gitroom/backend/ecosystem/bootstrap.service';
import { BootstrapDto } from '@gitroom/nestjs-libraries/dtos/provision/bootstrap.dto';

@Injectable()
export class BootstrapGuard implements CanActivate {
  constructor(private readonly service: BootstrapService) {}
  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<RawBodyRequest<Request>>();
    await this.service.authenticate(request.headers, request.rawBody);
    return true;
  }
}

// The public nginx /api prefix is stripped before reaching Nest.
@Controller('/internal/first-party')
export class BootstrapController {
  constructor(private readonly service: BootstrapService) {}

  @Post('/bootstrap')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  @UseGuards(BootstrapGuard)
  bootstrap(
    @Body(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false, value: false },
      })
    )
    body: BootstrapDto
  ) {
    return this.service.bootstrap(body);
  }
}
