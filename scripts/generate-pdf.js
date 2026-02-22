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
            document.body.style.backgroundColor = 'white';
            document.body.style.color = 'black';

            const resumeSection = document.getElementById('view-resume');
            if (resumeSection) {
                resumeSection.classList.remove('hidden'); // Ensure it's not hidden by SPA logic
                resumeSection.style.display = 'block';
                resumeSection.style.backgroundColor = 'white';
                resumeSection.style.color = 'black';

                // Hide ALL other sections
                document.querySelectorAll('section:not(#view-resume)').forEach(s => {
                    s.style.display = 'none';
                });

                // Hide header/footer/particles
                document.querySelectorAll('header, footer, canvas').forEach(el => {
                    el.style.display = 'none';
                });

                // Clear out the dark theme cards and text specifically
                const all = resumeSection.querySelectorAll('*');
                all.forEach(el => {
                    const element = el;
                    element.style.color = 'black';
                    element.style.backgroundColor = 'transparent';
                    element.style.borderColor = '#ccc';
                    element.style.backgroundImage = 'none';
                    element.style.boxShadow = 'none';
                    element.style.backdropFilter = 'none';

                    // Specific overrides for headers to be bolder in black
                    if (element.tagName.startsWith('H')) {
                        element.style.color = 'black';
                    }
                });
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
