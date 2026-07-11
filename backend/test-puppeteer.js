const puppeteer = require('puppeteer');

(async () => {
    try {
        console.log('Attempting to launch browser...');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        console.log('Browser launched successfully!');
        const page = await browser.newPage();
        await page.setContent('<h1>Test</h1>');
        await page.pdf({ path: 'test.pdf' });
        console.log('PDF generated successfully!');
        await browser.close();
    } catch (err) {
        console.error('Puppeteer failed:', err);
        process.exit(1);
    }
})();
