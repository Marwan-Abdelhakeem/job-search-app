import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port: number = Number(process.env.PORT);

  await app.listen(port ?? 3002, () => {
    console.log(`server is running on port ${port}`);
  });
}
bootstrap();
