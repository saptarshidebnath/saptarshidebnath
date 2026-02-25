import { setWorldConstructor, BeforeAll, AfterAll, Before, After, World } from '@cucumber/cucumber';
import { chromium, type Browser, type BrowserContext, type Page, devices } from 'playwright';

let browser: Browser;

export class CustomWorld extends World {
    context?: BrowserContext;
    page?: Page;
}

setWorldConstructor(CustomWorld);

BeforeAll(async function () {
    browser = await chromium.launch({ headless: true });
});

AfterAll(async function () {
    await browser.close();
});

After(async function (this: CustomWorld) {
    if (this.page) {
        await this.page.close();
    }
    if (this.context) {
        await this.context.close();
    }
});
