const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { SwaggerModule, DocumentBuilder } = require('@nestjs/swagger');
const { AppModule } = require('../dist/app.module');

let cachedApp;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new ExpressAdapter());

    const config = new DocumentBuilder()
        .setTitle('NorthWay Solar Engine API')
        .setDescription('CRM para energia solar')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    const frontendUrl = (process.env.FRONTEND_URL || '').trim();
    app.enableCors({
        origin: frontendUrl || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    await app.init();
    return app.getHttpAdapter().getInstance();
}

module.exports = async (req, res) => {
    try {
        if (!cachedApp) {
            cachedApp = await bootstrap();
        }
        cachedApp(req, res);
    } catch (err) {
        console.error('Error:', err.message, err.stack);
        res.status(500).json({ statusCode: 500, message: err.message });
    }
};
