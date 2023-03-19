import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import { DependenciesAnalizer } from 'Dependencies-analizer/dependencies-analizer';

config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });
  app.enableCors();

  // for development only! for DI debuging!
  // -------------------
  const da = new DependenciesAnalizer(app);
  da.start();
  // -------------------

  await app.listen(6000);
}
bootstrap();
