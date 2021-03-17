import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const { HOST = "127.0.0.1" } = process.env;

  await app.listen(3050, HOST);
  const app = await NestFactory.create(AppModule);
  await app.listen(3050, "149.28.253.254");
}
bootstrap();
