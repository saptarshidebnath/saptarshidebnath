import './style.scss';
import { initWebGL } from './webgl';

// Initialize the 3D hero background
initWebGL();

interface ResumeJob {
    role: string;
    company: string;
    duration: string;
    web_summary?: string;
    highlights: string[];
}

interface ResumeEducation {
    degree: string;
    institution: string;
    year: string;
}

interface ResumeData {
    name: string;
    contact: {
        email: string;
        location: string;
        linkedIn: string;
        github: string;
    };
    summary: string;
    experience: ResumeJob[];
    skills: string[];
    education: ResumeEducation[];
}

// Fetch and render the resume JSON
async function renderResume() {
    const container = document.getElementById('resume-container');
    if (!container) return;

    try {
        // Fetch raw JSON from public/data or relative path
        const res = await fetch('/data/resume.json');
        if (!res.ok) throw new Error('Failed to load resume.json');

        const resumeData = await res.json();

        // Build HTML from JSON
        let html = '';

        // Header / Summary
        html += `
            <div class="mb-10 text-center sm:text-left print:mb-6 print:text-left print:border-b-2 print:border-black print:pb-4">
                <h3 class="text-2xl font-bold text-white print:text-black print:text-3xl print:font-serif">${resumeData.name}</h3>
                <div class="mt-2 text-sm text-slate-400 flex flex-wrap justify-center sm:justify-start gap-4 print:mt-1 print:text-black">
                    <span>${resumeData.contact.email}</span>
                    <span class="print:hidden">&bull;</span>
                    <span class="hidden print:inline-block">|</span>
                    <span>${resumeData.contact.location}</span>
                    <span class="print:hidden">&bull;</span>
                    <span class="hidden print:inline-block">|</span>
                    <span>${resumeData.contact.linkedIn}</span>
                </div>
                <p class="mt-4 text-slate-300 leading-relaxed max-w-3xl print:text-black print:mt-3 print:leading-snug">${resumeData.summary}</p>
            </div>
        `;

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            html += `<h4 class="text-xl font-bold text-white border-b border-slate-600 pb-2 mb-6 print:mb-2 print:text-black print:text-lg print:border-b print:border-black print:uppercase print:tracking-wide">Experience</h4>`;
            html += `<div class="space-y-8 print:space-y-4">`;

            resumeData.experience.forEach((job: ResumeJob) => {
                html += `
                <div class="prevent-print-break border-b border-slate-700/50 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0 print:border-0 print:pb-0 print:mb-3">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 print:mb-1">
                        <h5 class="text-lg font-bold text-white print:text-black print:text-base">${job.role} <span class="hidden print:inline">,</span> <span class="text-slate-400 font-normal print:text-black print:italic print:font-semibold"> ${job.company}</span></h5>
                        <span class="text-sm font-medium text-slate-400 mt-1 sm:mt-0 print:text-black print:italic">${job.duration}</span>
                    </div>
                    ${job.web_summary ? `<p class="text-slate-300 text-sm mb-3 print:hidden leading-relaxed">${job.web_summary}</p>` : ''}
                    <ul class="list-disc list-outside ml-5 text-slate-300 space-y-2 marker:text-blue-500 ${job.web_summary ? 'hidden print:block' : ''} print:text-black print:space-y-1 print:text-sm print:marker:text-black">
                        ${job.highlights.map((h: string) => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
                `;
            });
            html += `</div>`;
        }

        // Setup simple two-column layout for Skills & Education on large screens
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 print:mt-4 print:gap-4 print:grid-cols-1">`;

        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
            html += `
            <div class="prevent-print-break">
                <h4 class="text-xl font-bold text-white border-b border-slate-600 pb-2 mb-6 print:mb-2 print:text-black print:text-lg print:border-black print:uppercase print:tracking-wide">Technical Skills</h4>
                <div class="flex flex-wrap gap-2 print:gap-1">
                    ${resumeData.skills.map((skill: string) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800/40 text-blue-300 print:px-0 print:py-0 print:rounded-none print:bg-transparent print:text-black print:font-normal print:after:content-[',_'] print:last:after:content-['']">${skill}</span>`).join('')}
                </div>
            </div>`;
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
            html += `
            <div class="prevent-print-break print:mt-4">
                <h4 class="text-xl font-bold text-white border-b border-slate-600 pb-2 mb-6 print:mb-2 print:text-black print:text-lg print:border-black print:uppercase print:tracking-wide">Education</h4>
                <div class="space-y-4 print:space-y-2">
            `;

            resumeData.education.forEach((edu: ResumeEducation) => {
                html += `
                <div>
                    <div class="flex justify-between items-baseline mb-1">
                        <h5 class="text-base font-bold text-white print:text-black print:font-bold">${edu.institution}</h5>
                        <div class="text-sm text-slate-400 print:text-black print:italic">${edu.year}</div>
                    </div>
                    <div class="text-sm text-slate-400 print:text-black">${edu.degree}</div>
                </div>
                `;
            });
            html += `</div></div>`;
        }

        html += `</div>`; // End Grid

        container.innerHTML = html;

    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="text-center py-12 text-red-500">Error loading resume data. Please try again later.</div>`;
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
        // e.g. /about -> about
        targetView = path.replace('/', '');
    }

    const targetEl = document.getElementById(`view-${targetView}`) || document.getElementById('view-home');
    const currentEl = document.querySelector('.spa-view:not(.hidden)') as HTMLElement | null;

    if (currentEl === targetEl) return;

    isNavigating = true;

    // Update active nav link styling
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === path || (path === '/' && link.getAttribute('href') === '/home')) {
            link.classList.add('text-blue-400');
            link.classList.remove('text-white');
        } else {
            link.classList.remove('text-blue-400');
            link.classList.add('text-white');
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
