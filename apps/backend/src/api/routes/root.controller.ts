import { Controller, Get } from '@nestjs/common';
@Controller('/')
export class RootController {
  @Get('/')
  getRoot(): string {
    return 'App is running!';
  }

  @Get('/health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'crove-post',
    };
  }
}
