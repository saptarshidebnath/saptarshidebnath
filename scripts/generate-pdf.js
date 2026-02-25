import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

(async () => {
    // Ensure the public directory exists since we write the PDF there
    const publicDir = resolve('public');
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir);
    }

    // Ensure data directory gets copied to dist so the fetch works on the local node server
    const { cpSync } = await import('fs');
    cpSync('data', 'dist/data', { recursive: true });

    // Path to the local Vite dist server
    // Note: To generate the PDF correctly, we need the site to be running,
    // or we can just spin up a quick express/http server against 'dist'
    // For simplicity, we'll start a simple local server using `serve-static` or similar
    // Alternatively, we can let Vite run, hit it, and close it.

    console.log('Starting PDF generation using Puppeteer...');

    // We launch Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Emulate a screen so Tailwind layout triggers constraints properly
    await page.setViewport({ width: 1200, height: 800 });

    try {
        // We use Vite's preview server if available, but simplest for build scripts 
        // without a server is to load the file directly, BUT fetch('/data/resume.json') 
        // will fail on file:// protocol.

        // So we will spin up a microscopic server to serve dist/
        const { createServer } = await import('http');
        const serveHandler = (await import('serve-handler')).default;

        const server = createServer((request, response) => {
            return serveHandler(request, response, {
                public: resolve('dist')
            });
        });

        await new Promise((resolveServer) => {
            server.listen(3000, () => {
                resolveServer();
            });
        });

        console.log('Local server running on port 3000 for PDF generation');

        // Go to the local server, specifically the resume route
        await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle0' });

        // Wait for the dynamic fetch to complete and render the resume container
        await page.waitForSelector('#resume-container .prevent-print-break', { visible: true, timeout: 15000 });

        // Polish the view for print
        await page.evaluate(() => {
            // Force a lighter theme for the screenshot/PDF capture
            const html = document.documentElement;
            html.style.backgroundColor = 'white';
            html.style.color = 'black';

            document.body.style.backgroundColor = 'white';
            document.body.style.color = 'black';
            document.body.style.height = 'auto';
            document.body.style.minHeight = '100%';
            document.body.style.overflow = 'visible';

            html.style.backgroundColor = 'white';
            html.style.height = 'auto';
            html.style.minHeight = '100%';

            const resumeSection = document.getElementById('view-resume');
            const container = document.getElementById('resume-container');

            if (resumeSection && container) {
                resumeSection.classList.remove('hidden');
                resumeSection.style.setProperty('display', 'block', 'important');
                resumeSection.style.setProperty('background-color', 'white', 'important');
                resumeSection.style.setProperty('color', 'black', 'important');
                resumeSection.style.setProperty('padding', '0', 'important');
                resumeSection.style.setProperty('margin', '0', 'important');
                resumeSection.style.setProperty('filter', 'none', 'important');
                resumeSection.style.setProperty('backdrop-filter', 'none', 'important');

                // Explicitly clear container styles and prevent the "blue glow" shadow
                container.style.setProperty('background-color', 'white', 'important');
                container.style.setProperty('color', 'black', 'important');
                container.style.setProperty('box-shadow', 'none', 'important');
                container.style.setProperty('border', 'none', 'important');
                container.style.setProperty('outline', 'none', 'important');
                container.style.setProperty('background-image', 'none', 'important');
                container.style.setProperty('padding', '0', 'important');

                // Hide ALL other sections and potential overlapping elements
                document.querySelectorAll('section:not(#view-resume), header, footer, canvas, button:not(.hidden-print), .print\\:hidden').forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });

                // Ensure main and other wrappers don't leak backgrounds
                document.querySelectorAll('main, div:not(#resume-container):not(#view-resume)').forEach(el => {
                    el.style.setProperty('background-color', 'transparent', 'important');
                    el.style.setProperty('background-image', 'none', 'important');
                    el.style.setProperty('box-shadow', 'none', 'important');
                    el.style.setProperty('filter', 'none', 'important');
                });

                // Clear out ALL thematic styles recursively
                const all = container.querySelectorAll('*');
                all.forEach(el => {
                    const element = el;
                    element.style.setProperty('color', 'black', 'important');
                    element.style.setProperty('background-color', 'transparent', 'important');
                    element.style.setProperty('border-color', 'transparent', 'important');
                    element.style.setProperty('background-image', 'none', 'important');
                    element.style.setProperty('box-shadow', 'none', 'important');
                    element.style.setProperty('outline', 'none', 'important');
                    element.style.setProperty('backdrop-filter', 'none', 'important');
                    element.style.setProperty('text-shadow', 'none', 'important');

                    if (element.tagName.startsWith('H')) {
                        element.style.setProperty('color', 'black', 'important');
                        element.style.setProperty('font-weight', 'bold', 'important');
                    }
                });
            }
        });

        // Wait a small amount for any last minute rendering
        await new Promise(r => setTimeout(r, 500));

        const pdfPath = resolve('public', 'saptarshi-debnath.pdf');
        const distPdfPath = resolve('dist', 'saptarshi-debnath.pdf');

        await page.pdf({
            path: pdfPath,
            format: 'Letter',
            printBackground: false,
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
                right: '0.5in'
            }
        });

        // Ensure the PDF is also in dist/ for deployment
        const { copyFileSync } = await import('fs');
        copyFileSync(pdfPath, distPdfPath);

        console.log(`PDF generated successfully at: ${pdfPath} and copied to ${distPdfPath}`);

        server.close();
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
