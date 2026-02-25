import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { existsSync, mkdirSync, cpSync, copyFileSync } from 'fs';
import { createServer } from 'http';
import serveHandler from 'serve-handler';

(async () => {
    // Ensure the public directory exists since we write the PDF there
    const publicDir = resolve('public');
    if (!existsSync(publicDir)) {
        mkdirSync(publicDir);
    }

    // Ensure data directory gets copied to dist so the fetch works on the local node server
    cpSync('data', 'dist/data', { recursive: true });

    console.log('Starting local server for PDF generation...');

    // Spin up a simple server to serve dist/
    // Added rewrites to ensure SPA routing works for the /resume path
    const server = createServer((request, response) => {
        return serveHandler(request, response, {
            public: resolve('dist'),
            rewrites: [
                { source: '**', destination: '/index.html' }
            ]
        });
    });

    await new Promise((resolveServer) => {
        server.listen(3000, () => resolveServer());
    });

    console.log('Local server running on port 3000. Launching Puppeteer...');

    // Launch Puppeteer
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    // Emulate screen and print media type to trigger your style.scss @media print styles
    await page.setViewport({ width: 1200, height: 800 });
    await page.emulateMediaType('print');

    try {
        // Go to the local server, specifically the resume route
        await page.goto('http://localhost:3000/resume', { waitUntil: 'networkidle0' });

        // Wait for the dynamic fetch to complete and render the resume container
        await page.waitForSelector('#resume-container .prevent-print-break', { visible: true, timeout: 15000 });

        // Wait a small amount for any last minute rendering / font loading
        await new Promise(r => setTimeout(r, 1000));

        const pdfPath = resolve('public', 'saptarshi-debnath.pdf');
        const distPdfPath = resolve('dist', 'saptarshi-debnath.pdf');

        // Generate the PDF
        await page.pdf({
            path: pdfPath,
            format: 'Letter',
            printBackground: false, // The @media print config handles keeping things clean
            margin: {
                top: '0.5in',
                bottom: '0.5in',
                left: '0.5in',
                right: '0.5in'
            }
        });

        // Ensure the PDF is also in dist/ for deployment
        copyFileSync(pdfPath, distPdfPath);

        console.log(`PDF generated successfully at: ${pdfPath} and copied to ${distPdfPath}`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    } finally {
        await browser.close();
        server.close();
    }
})();
