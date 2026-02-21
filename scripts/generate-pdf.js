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

        // Go to the local server
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

        // Wait for the dynamic fetch to complete and render
        await page.waitForSelector('#resume-container .prevent-print-break', { timeout: 10000 });

        // Hide specific elements we don't want in the PDF that Tailwind print macros might miss
        await page.evaluate(() => {
            // Ensure the main layout drops padding that exists for the web hero
            document.body.style.paddingTop = '0';

            // Re-render specifically for print if needed, but our Tailwind @media print should handle it
            const resumeSection = document.getElementById('resume-container');
            if (resumeSection) {
                // Force pure white background and remove slate/dark theme overlays
                resumeSection.className = 'p-8 m-0 bg-white text-black';

                // Aggressively strip any white/light text classes from ALL children
                const allElements = resumeSection.querySelectorAll('*');
                allElements.forEach(el => {
                    // Remove classes that force light text or dark backgrounds
                    el.className = el.className.replace(/\b(text-white|text-slate-\d+|bg-slate-\d+|bg-blue-\d+\/\d+|bg-white\/\d+|border-slate-\d+)\b/g, '');
                    // Force text-black
                    el.classList.add('text-black');
                });

                // isolate the resume section container for printing
                document.body.innerHTML = resumeSection.outerHTML;
                document.body.className = 'bg-white text-black print:bg-white print:text-black font-serif'; // Reset body classes for traditional look
            }
        });

        // Wait a small amount for any last minute rendering
        await new Promise(r => setTimeout(r, 500));

        const pdfPath = resolve('public', 'saptarshi-debnath.pdf');

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
                right: '0.5in'
            }
        });

        console.log(`PDF generated successfully at: ${pdfPath}`);

        server.close();
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();
