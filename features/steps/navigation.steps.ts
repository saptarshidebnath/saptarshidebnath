import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { chromium, devices } from 'playwright';
import { CustomWorld } from '../support/world';

Given('I am on the homepage using a {string}', async function (this: CustomWorld, deviceType: string) {
    let viewport;
    switch (deviceType) {
        case 'Mobile':
            viewport = devices['iPhone 12'].viewport;
            break;
        case 'Tablet':
            viewport = devices['iPad Mini'].viewport;
            break;
        case 'Desktop':
        default:
            viewport = { width: 1280, height: 800 };
            break;
    }

    // Create a new browser context with the specified viewport
    const browser = await chromium.launch();
    this.context = await browser.newContext({ viewport });
    this.page = await this.context.newPage();

    await this.page.goto('http://localhost:5173/');

    // Wait for the hydration to finish (our pulse loader)
    await this.page.waitForSelector('.fouc-cloak', { state: 'detached', timeout: 5000 });
});

When('I open the navigation menu if needed on {string}', async function (this: CustomWorld, deviceType: string) {
    if (!this.page) throw new Error("Page not initialized");

    if (deviceType === 'Mobile' || deviceType === 'Tablet') {
        const menuBtn = this.page.locator('#mobile-menu-btn');
        await menuBtn.click();

        // Wait for the bizarre css animation to settle
        await this.page.waitForTimeout(600);
    }
});

When('I click {string} in the navigation', async function (this: CustomWorld, linkText: string) {
    if (!this.page) throw new Error("Page not initialized");

    // Click the link that matches the text. 
    // Playwright's locator is remarkably good at finding visible text regardless of desktop vs mobile menu.
    const link = this.page.locator(`nav, #mobile-menu`).locator(`text=${linkText}`).first();
    await link.click();
});

Then('I should see the {string} section', async function (this: CustomWorld, sectionName: string) {
    if (!this.page) throw new Error("Page not initialized");

    const sectionId = `#view-${sectionName.toLowerCase()}`;
    const section = this.page.locator(sectionId);

    // Ensure the section is visible and not hidden by our SPA router logic
    await expect(section).toBeVisible();
});
