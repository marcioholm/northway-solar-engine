const { NestFactory } = require('@nestjs/core');
const { ExpressAdapter } = require('@nestjs/platform-express');
const { AppModule } = require('../dist/app.module');
const { configureApp } = require('../dist/app.setup');

let cachedApp;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, new ExpressAdapter());

    configureApp(app);

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
        res.status(500).json({ statusCode: 500, message: err.message, stack: err.stack?.split('\n').slice(0, 6).join('\n') });
    }
};
