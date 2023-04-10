import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DependenciesAnalizer } from 'DEV-dependencies-analizer/dependencies-analizer';
import { AppValidationPipeOptions } from './validation/AppValidationPipeOptions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe(AppValidationPipeOptions));

  // for development only! for DI debuging!
  // -------------------
  const da = new DependenciesAnalizer(app);
  console.log(await da.start());
  // -------------------

  await app.listen(6000);
}
bootstrap();
