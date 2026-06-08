"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
if (process.env.NODE_ENV !== 'production') {
    (0, dotenv_1.config)({ path: (0, path_1.resolve)(process.cwd(), '.env'), override: true });
}
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    app.enableCors({
        origin: process.env.NODE_ENV === 'production' ? clientUrl : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Eventful Ticketing Platform API')
        .setDescription('Eventful is a high-performance backend for discovering, booking, paying, verifying, and analytics for events.\n\n' +
        '### Role Privileges:\n' +
        '- **CREATOR**: Create events, view attendee listings, scan ticket QR codes, track payments, view analytics dashboard.\n' +
        '- **EVENTEE**: View events, book and pay for tickets, view ticket QR codes, set custom reminders.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter your Bearer Access Token retrieved from Auth endpoints',
        in: 'header',
    }, 'bearer')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    const dbHost = (() => {
        try {
            return new URL(process.env.DATABASE_URL || '').host;
        }
        catch {
            return 'unknown';
        }
    })();
    console.log(`🚀 Eventful Backend is running on: http://localhost:${port}`);
    console.log(`🗄️  Database host: ${dbHost}`);
    console.log(`📚 Swagger Documentation is available on: http://localhost:${port}/docs`);
}
bootstrap();
//# sourceMappingURL=main.js.map