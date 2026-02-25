import './style.scss';
import { initWebGL } from './webgl';
import { renderResumeHTML, renderHeroHTML, renderSocialLinksHTML, renderContactHTML, type ResumeData } from './render-engine';

// Initialize the 3D hero background
initWebGL();

// Helper to handle contact info reveal
function setupRevealListener(id: string, type: 'email' | 'phone') {
    const el = document.getElementById(id);
    if (!el) return;

    const originalHTML = el.innerHTML;
    const svgIcon = originalHTML.match(/<svg.*?>.*?<\/svg>/s)?.[0] || '';

    el.addEventListener('click', () => {
        const encoded = el.getAttribute(type === 'email' ? 'data-e' : 'data-p');
        if (encoded) {
            const val = atob(encoded);
            if (type === 'email') {
                el.outerHTML = `<a href="mailto:${val}" class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">${svgIcon}<span>${val}</span></a>`;
            } else {
                const cleanPhone = val.replace(/\D/g, '');
                el.outerHTML = `<a href="tel:${cleanPhone}" class="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">${svgIcon}<span>${val}</span></a>`;
            }
        }
    });
}

// Fetch and render the resume JSON
async function renderResume() {
    const resumeContainer = document.getElementById('resume-container');
    const heroSection = document.getElementById('view-home');
    const contactContainer = document.getElementById('contact-container');

    if (!resumeContainer) return;

    try {
        const res = await fetch('/data/resume.json');
        if (!res.ok) throw new Error('Failed to load resume.json');

        const resumeData: ResumeData = await res.json();

        // Dynamically update SEO meta tags
        document.title = `${resumeData.name} - Staff Engineer & System Design Architect`;
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${resumeData.name} - Staff Engineer`);

        const shortDescription = resumeData.summary.length > 150
            ? resumeData.summary.substring(0, resumeData.summary.indexOf('.') + 1) || resumeData.summary.substring(0, 150) + '...'
            : resumeData.summary;

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', shortDescription);

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', shortDescription);

        // Hydrate Sections
        if (heroSection) renderHeroHTML(heroSection, resumeData);
        if (contactContainer) contactContainer.innerHTML = renderContactHTML(resumeData);
        resumeContainer.innerHTML = renderResumeHTML(resumeData);

        // Bind reveal listeners for Resume header
        setupRevealListener('reveal-email', 'email');
        setupRevealListener('reveal-phone', 'phone');

        // Bind reveal listeners for Contact page
        setupRevealListener('reveal-email-contact', 'email');
        setupRevealListener('reveal-phone-contact', 'phone');

        // Print Preview Toggle
        const togglePrintBtn = document.getElementById('toggle-print-preview-btn');
        if (togglePrintBtn) {
            togglePrintBtn.addEventListener('click', () => {
                document.documentElement.classList.toggle('print-preview');
                const isPreview = document.documentElement.classList.contains('print-preview');
                togglePrintBtn.textContent = isPreview ? 'Exit Preview' : 'Preview Print';

                // When in preview, we might need to hide/show views correctly
                if (isPreview) {
                    const resumeView = document.getElementById('view-resume');
                    if (resumeView) {
                        resumeView.classList.remove('hidden');
                        resumeView.style.display = 'block';
                    }
                } else {
                    handleRoute(); // Refresh visibility based on path
                }
            });
        }

        // PDF Download
        const downloadBtn = document.getElementById('download-resume-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const filename = `${resumeData.name.toLowerCase().replace(/\s+/g, '-')}.pdf`;
                const link = document.createElement('a');
                link.href = `/${filename}`;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

    } catch (err) {
        console.error(err);
        if (resumeContainer) {
            resumeContainer.innerHTML = `<div class="text-center py-12 text-red-500">Error loading resume data. Please try again later.</div>`;
        }
    } finally {
        // Wait for all fonts to load before revealing
        if ('fonts' in document) {
            await document.fonts.ready;
        }
        // Reveal the page after hydration is complete to prevent FOUC
        document.body.classList.remove('fouc-cloak');
    }
}


let isNavigating = false;

// Custom SPA Router
function handleRoute() {
    if (isNavigating) return;

    // Support for GitHub Pages SPA redirect hack (404.html)
    (function (l) {
        if (l.search[1] === 'p' && l.search[2] === '=') {
            const decoded = l.search.slice(3).replace(/~and~/g, '&');
            const path = decoded.split('&q=')[0];
            const query = decoded.split('&q=')[1] || '';
            window.history.replaceState(null, '',
                l.pathname.slice(0, -1) + (path ? '/' + path : '') + (query ? '?' + query : '') + l.hash
            );
        }
    }(window.location));

    const path = window.location.pathname;

    // Default to home if root
    let targetView = 'home';
    if (path !== '/' && path !== '') {
        targetView = path.replace('/', '');
    }

    const targetEl = document.getElementById(`view-${targetView}`) || document.getElementById('view-home');
    const currentEl = document.querySelector('.spa-view:not(.hidden)') as HTMLElement | null;

    if (currentEl === targetEl) return;

    isNavigating = true;

    // Update active nav link styling
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        // If it's the root path, match exactly "/"
        // Otherwise match exact path
        if (href === path) {
            link.classList.add('text-blue-400');
            link.classList.remove('text-slate-50', 'hover:text-blue-400');
        } else {
            link.classList.remove('text-blue-400');
            link.classList.add('text-slate-50', 'hover:text-blue-400');
        }
    });

    const showTarget = () => {
        if (!targetEl) {
            isNavigating = false;
            return;
        }

        // Hide all views just in case
        document.querySelectorAll('.spa-view').forEach(el => {
            if (el !== targetEl) {
                el.classList.add('hidden');
                el.classList.remove('opacity-100', 'translate-y-0', 'opacity-0', '-translate-y-4', 'translate-y-4');
            }
        });

        // Prepare target for entry
        targetEl.classList.remove('hidden');
        targetEl.classList.add('opacity-0', 'translate-y-4');
        targetEl.classList.remove('opacity-100', 'translate-y-0', '-translate-y-4');

        // Force reflow
        void targetEl.offsetWidth;

        // Animate in
        targetEl.classList.remove('opacity-0', 'translate-y-4');
        targetEl.classList.add('opacity-100', 'translate-y-0');

        setTimeout(() => {
            isNavigating = false;
        }, 300); // Wait for transition
    };

    if (currentEl) {
        // Animate out
        currentEl.classList.remove('opacity-100', 'translate-y-0', 'translate-y-4');
        currentEl.classList.add('opacity-0', '-translate-y-4');

        setTimeout(() => {
            currentEl.classList.add('hidden');
            window.scrollTo(0, 0); // Scroll top while hidden
            showTarget();
        }, 300); // Wait for tailwind duration-300
    } else {
        showTarget();
        window.scrollTo(0, 0);
    }
}

// Intercept navigate clicks
document.addEventListener('click', e => {
    const target = (e.target as Element).closest('a.nav-link');
    if (target) {
        e.preventDefault();
        if (isNavigating) return;
        const href = target.getAttribute('href');
        if (href) {
            window.history.pushState({}, '', href);
            handleRoute();
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', handleRoute);

// Kick off
renderResume().then(() => {
    // Run initial route once DOM is ready
    handleRoute();
});
