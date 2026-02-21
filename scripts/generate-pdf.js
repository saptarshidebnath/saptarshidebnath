import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

(async () => {
    // Ensure the public directory exists since we write the PDF there
    const publicDir = resolve('public');
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir);
    }

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

        // Hide specific elements we don't want in the PDF that Tailwind print macros might miss
        await page.evaluate(() => {
            // Ensure the main layout drops padding that exists for the web hero
            document.body.style.paddingTop = '0';

            // Re-render specifically for print if needed, but our Tailwind @media print should handle it
            const resumeSection = document.getElementById('resume');
            if (resumeSection) {
                // isolate the resume section for printing
                document.body.innerHTML = resumeSection.outerHTML;
                document.body.className = 'bg-white text-black p-8'; // Reset body classes
            }
        });

        // Wait a small amount for any last minute rendering
        await new Promise(r => setTimeout(r, 500));

        const pdfPath = resolve('public', 'resume.pdf');

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
