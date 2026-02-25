import { test, expect } from '@playwright/test';

test.describe('SPA Navigation', () => {

    test.beforeEach(async ({ page }) => {
        // Go to the local dev server
        await page.goto('/');

        // Wait for the hydration logic (pulse loader) to finish
        await expect(page.locator('.fouc-cloak')).not.toBeAttached({ timeout: 5000 });
    });

    test('Navigating to the Resume page via Navigation', async ({ page }) => {
        // Tailwind 'sm' breakpoint is 640px. Anything below is mobile.
        const isMobileNav = (page.viewportSize()?.width || 0) < 640;

        // 1. Open Navigation Menu if Mobile viewport
        if (isMobileNav) {
            const menuBtn = page.locator('#mobile-menu-btn');
            await menuBtn.click();
            // Wait for CSS animation
            await page.waitForTimeout(600);
        }

        // 2. Click "Resume" link 
        const resumeLink = isMobileNav
            ? page.locator('#mobile-menu').locator('text=Resume').first()
            : page.locator('nav').locator('text=Resume').first();

        await resumeLink.click();

        // 3. Verify Resume section becomes visible
        const resumeSection = page.locator('#view-resume');
        await expect(resumeSection).toBeVisible();
    });

    test('Navigating to the Contact page via Navigation', async ({ page }) => {
        const isMobileNav = (page.viewportSize()?.width || 0) < 640;

        // 1. Open Navigation Menu if Mobile/Tablet
        if (isMobileNav) {
            const menuBtn = page.locator('#mobile-menu-btn');
            await menuBtn.click();
            // Wait for CSS animation
            await page.waitForTimeout(600);
        }

        // 2. Click "Contact" link 
        const contactLink = isMobileNav
            ? page.locator('#mobile-menu').locator('text=Contact').first()
            : page.locator('nav').locator('text=Contact').first();

        await contactLink.click();

        // 3. Verify Contact section becomes visible
        const contactSection = page.locator('#view-contact');
        await expect(contactSection).toBeVisible();
    });

});
