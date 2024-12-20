import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3002;
  const host = process.env.HOST || 'localhost';
  await app.listen(port, host);
}
bootstrap();
