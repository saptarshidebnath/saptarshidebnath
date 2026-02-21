import './style.scss';
import { initWebGL } from './webgl';

// Initialize the 3D hero background
initWebGL();

interface ResumeJob {
    role: string;
    company: string;
    duration: string;
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
            <div class="mb-10 text-center sm:text-left print:mb-6">
                <h3 class="text-2xl font-bold text-white">${resumeData.name}</h3>
                <div class="mt-2 text-sm text-slate-400 flex flex-wrap justify-center sm:justify-start gap-4">
                    <span>${resumeData.contact.email}</span>
                    <span>&bull;</span>
                    <span>${resumeData.contact.location}</span>
                </div>
                <p class="mt-4 text-slate-300 leading-relaxed max-w-3xl">${resumeData.summary}</p>
            </div>
        `;

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
            html += `<h4 class="text-xl font-bold text-white border-b border-slate-800 pb-2 mb-6 print:mb-4">Experience</h4>`;
            html += `<div class="space-y-8 print:space-y-6">`;

            resumeData.experience.forEach((job: ResumeJob) => {
                html += `
                <div class="prevent-print-break">
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2">
                        <h5 class="text-lg font-bold text-white">${job.role} <span class="text-slate-400 font-normal">at ${job.company}</span></h5>
                        <span class="text-sm font-medium text-slate-400 mt-1 sm:mt-0">${job.duration}</span>
                    </div>
                    <ul class="list-disc list-outside ml-5 text-slate-300 space-y-2 marker:text-blue-500">
                        ${job.highlights.map((h: string) => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
                `;
            });
            html += `</div>`;
        }

        // Setup simple two-column layout for Skills & Education on large screens
        html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 print:mt-8 print:gap-4">`;

        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
            html += `
            <div class="prevent-print-break">
                <h4 class="text-xl font-bold text-white border-b border-slate-800 pb-2 mb-6 print:mb-4">Technical Skills</h4>
                <div class="flex flex-wrap gap-2">
                    ${resumeData.skills.map((skill: string) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900/30 text-blue-300 print:border print:border-gray-300 print:bg-white print:text-white">${skill}</span>`).join('')}
                </div>
            </div>`;
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
            html += `
            <div class="prevent-print-break">
                <h4 class="text-xl font-bold text-white border-b border-slate-800 pb-2 mb-6 print:mb-4">Education</h4>
                <div class="space-y-4">
            `;

            resumeData.education.forEach((edu: ResumeEducation) => {
                html += `
                <div>
                    <h5 class="text-base font-bold text-white">${edu.degree}</h5>
                    <div class="text-sm text-slate-400">${edu.institution} &bull; ${edu.year}</div>
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
