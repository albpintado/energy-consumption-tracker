import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle("Energy Consumption Tracker API")
    .setDescription("API for tracking energy consumption with rates, discounts, and contracts")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);
  app.enableCors({
    origin: ["http://localhost:3001", "https://energy-consumption-tracker-app.vercel.app/"],
  });
  await app.listen(3000);
}
bootstrap();
