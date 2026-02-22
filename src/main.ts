import './style.scss';
import { initWebGL } from './webgl';
import { renderResumeHTML, renderHeroHTML, renderSocialLinksHTML, type ResumeData } from './render-engine';

// Initialize the 3D hero background
initWebGL();

// Fetch and render the resume JSON
async function renderResume() {
    const container = document.getElementById('resume-container');
    const heroSection = document.getElementById('view-home');
    const socialLinks = document.querySelector('#view-contact .flex.justify-center.space-x-6');

    if (!container) return;

    try {
        // Fetch raw JSON from public/data or relative path
        const res = await fetch('/data/resume.json');
        if (!res.ok) throw new Error('Failed to load resume.json');

        const resumeData: ResumeData = await res.json();

        // Dynamically update SEO meta tags
        document.title = `${resumeData.name} - Staff Engineer & System Design Architect`;

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', `${resumeData.name} - Staff Engineer`);

        // Use a shortened version of the summary for the description (first sentence or up to ~150 chars)
        const shortDescription = resumeData.summary.length > 150
            ? resumeData.summary.substring(0, resumeData.summary.indexOf('.') + 1) || resumeData.summary.substring(0, 150) + '...'
            : resumeData.summary;

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', shortDescription);

        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', shortDescription);

        // Hydrate Hero Section
        if (heroSection) renderHeroHTML(heroSection, resumeData);

        // Hydrate Social Links
        if (socialLinks) socialLinks.innerHTML = renderSocialLinksHTML(resumeData);

        // Build HTML from JSON using the Rendering Engine
        container.innerHTML = renderResumeHTML(resumeData);

        // Add event listeners for reveal buttons
        const revealPhone = document.getElementById('reveal-phone');
        if (revealPhone) {
            revealPhone.addEventListener('click', () => {
                const encoded = revealPhone.getAttribute('data-p');
                if (encoded) {
                    const phone = atob(encoded);
                    const cleanPhone = phone.replace(/\D/g, '');
                    revealPhone.outerHTML = `<a href="tel:${cleanPhone}" class="text-blue-400 hover:text-blue-300 transition-colors">${phone}</a>`;
                }
            });
        }

        const revealEmail = document.getElementById('reveal-email');
        if (revealEmail) {
            revealEmail.addEventListener('click', () => {
                const encoded = revealEmail.getAttribute('data-e');
                if (encoded) {
                    const email = atob(encoded);
                    revealEmail.outerHTML = `<a href="mailto:${email}" class="text-blue-400 hover:text-blue-300 transition-colors">${email}</a>`;
                }
            });
        }

        // Add event listener for PDF download (obfuscated from crawlers)
        const downloadBtn = document.getElementById('download-resume-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                // Construct path in JS so it's not in the static HTML
                const filename = 'saptarshi-debnath.pdf';
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
        container.innerHTML = `<div class="text-center py-12 text-red-500">Error loading resume data. Please try again later.</div>`;
    } finally {
        // Reveal the page after hydration is complete to prevent FOUC
        document.body.classList.remove('fouc-cloak');
    }
}

let isNavigating = false;

// Custom SPA Router
function handleRoute() {
    if (isNavigating) return;
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
