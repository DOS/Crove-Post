import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { getBrandConfig } from '../utils/brand.config';

export const loadSwagger = (app: INestApplication) => {
  const brand = getBrandConfig();
  const config = new DocumentBuilder()
    .setTitle(`${brand.name} API Documentation`)
    .setDescription(`${brand.name} - ${brand.description}`)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};
