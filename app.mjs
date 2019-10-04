import puppeteer from 'puppeteer';

puppeteer.launch().then(async browser => {
    const page = await browser.newPage();
    await page.goto('https://www.google.com');
    await page.screenshot({path: 'example.png'});
    // other actions...
    await browser.close();
});