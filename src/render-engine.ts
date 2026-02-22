export interface ResumeJob {
    role: string;
    company: string;
    duration: string;
    web_summary?: string;
    highlights: string[];
}

export interface ResumeEducation {
    degree: string;
    institution: string;
    year: string;
}

export interface ResumeData {
    name: string;
    contact: {
        email: string;
        phone: string;
        location: string;
        linkedIn: string;
        github: string;
    };
    summary: string;
    hero_tagline?: string;
    hero_description?: string;
    experience: ResumeJob[];
    skills: string[];
    education: ResumeEducation[];
}

/**
 * Rendering Engine
 * Translates the ResumeData JSON object into a structured HTML string.
 */
export function renderResumeHTML(resumeData: ResumeData): string {
    let html = '';

    // Header / Summary
    html += `
        <div class="mb-10 text-center sm:text-left print:mb-6 print:text-left print:border-b-2 print:border-black print:pb-4">
            <h3 class="text-3xl font-bold text-white print:text-black print:text-5xl print:font-serif">${resumeData.name}</h3>
            <div class="mt-2 text-sm text-slate-400 flex flex-wrap justify-center sm:justify-start gap-4 print:mt-1 print:text-black">
                <span class="print:hidden">
                    <button id="reveal-email" class="hover:text-blue-400 transition-colors cursor-pointer" data-e="${btoa(resumeData.contact.email)}">
                        Click to reveal email
                    </button>
                </span>
                <span class="hidden print:inline-block">${resumeData.contact.email}</span>

                <span class="print:hidden">&bull;</span>
                <span class="hidden print:inline-block">|</span>
                
                <span class="print:hidden">
                    <button id="reveal-phone" class="hover:text-blue-400 transition-colors cursor-pointer" data-p="${btoa(resumeData.contact.phone)}">
                        Click to reveal phone
                    </button>
                </span>
                <span class="hidden print:inline-block">${resumeData.contact.phone}</span>
                <span class="hidden print:inline-block">|</span>

                <span class="print:hidden">&bull;</span>
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

        // Show only the last 3 jobs in detail, everything else in Earlier Career
        const recentExperience = resumeData.experience.slice(0, 3);
        const olderExperience = resumeData.experience.slice(3);

        html += `<div class="space-y-8 print:space-y-4">`;

        // Render Recent Experience (Detailed)
        recentExperience.forEach((job: ResumeJob) => {
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

        // Render Older Experience
        if (olderExperience.length > 0) {
            html += `
            <div class="pt-6 print:pt-4 print:border-t print:border-black/10">
                <h5 class="text-lg font-bold text-white mb-4 theme-text-accent print:text-black print:text-base print:mb-4">Earlier Career</h5>
                <div class="space-y-4 print:space-y-4">
                    ${olderExperience.map((job: ResumeJob) => `
                        <div class="print:hidden text-sm text-slate-400 border-l-2 border-slate-700 pl-4 py-1">
                            <div class="font-bold text-slate-300">${job.role} at ${job.company}</div>
                            <div>${job.duration}</div>
                        </div>
                        
                        <div class="hidden print:block prevent-print-break border-b border-slate-700/50 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0 print:border-0 print:pb-0 print:mb-3">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-2 print:mb-1">
                                <h5 class="text-lg font-bold text-white print:text-black print:text-sm italic">${job.role} <span class="hidden print:inline">,</span> <span class="text-slate-400 font-normal print:text-black print:not-italic print:font-semibold"> ${job.company}</span></h5>
                                <span class="text-sm font-medium text-slate-400 mt-1 sm:mt-0 print:text-black print:italic print:text-xs">${job.duration}</span>
                            </div>
                            <ul class="list-disc list-outside ml-5 text-slate-300 space-y-2 marker:text-blue-500 print:text-black print:space-y-0.5 print:text-xs print:marker:text-black">
                                ${job.highlights.map((h: string) => `<li>${h}</li>`).join('')}
                            </ul>
                        </div>
                    `).join('')}
                </div>
            </div>
            `;
        }
        html += `</div>`;
    }

    // Skills & Education Grid
    html += `<div class="grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 print:mt-4 print:gap-4 print:grid-cols-1">`;

    if (resumeData.skills && resumeData.skills.length > 0) {
        html += `
        <div class="prevent-print-break">
            <h4 class="text-xl font-bold text-white border-b border-slate-600 pb-2 mb-6 print:mb-2 print:text-black print:text-lg print:border-black print:uppercase print:tracking-wide">Technical Skills</h4>
            <div class="flex flex-wrap gap-2 print:gap-1">
                ${resumeData.skills.map((skill: string) => `<span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-800/40 text-blue-300 print:px-0 print:py-0 print:rounded-none print:bg-transparent print:text-black print:font-normal print:after:content-[',_'] print:last:after:content-['']">${skill}</span>`).join('')}
            </div>
        </div>`;
    }

    if (resumeData.education && resumeData.education.length > 0) {
        html += `
        <div class="prevent-print-break print:mt-4">
            <h4 class="text-xl font-bold text-white border-b border-slate-600 pb-2 mb-6 print:mb-2 print:text-black print:text-lg print:border-black print:uppercase print:tracking-wide">Education</h4>
            <div class="space-y-4 print:space-y-2">
                ${resumeData.education.map((edu: ResumeEducation) => `
                    <div>
                        <div class="flex justify-between items-baseline mb-1">
                            <h5 class="text-base font-bold text-white print:text-black print:font-bold">${edu.institution}</h5>
                            <div class="text-sm text-slate-400 print:text-black print:italic">${edu.year}</div>
                        </div>
                        <div class="text-sm text-slate-400 print:text-black">${edu.degree}</div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }

    html += `</div>`; // End Grid
    return html;
}

/**
 * Hydrates the Hero section content.
 */
export function renderHeroHTML(container: HTMLElement, resumeData: ResumeData) {
    const h1 = container.querySelector('h1');
    const tagline = container.querySelector('p.text-xl');
    const description = container.querySelector('p.text-lg');

    if (h1) h1.textContent = resumeData.name;
    if (tagline && resumeData.hero_tagline) {
        // Handle the Staff Engineer • System Design Architect bullet point
        const parts = resumeData.hero_tagline.split('&').map(p => p.trim());
        if (parts.length > 1) {
            tagline.innerHTML = `${parts[0]} <span class="text-blue-400">&bull;</span> ${parts[1]}`;
        } else {
            tagline.textContent = resumeData.hero_tagline;
        }
    }
    if (description && resumeData.hero_description) description.textContent = resumeData.hero_description;
}

/**
 * Hydrates the Social links in the Contact section.
 */
export function renderContactEmailHTML(email: string): string {
    return `<a href="mailto:${email}" class="text-slate-400 hover:text-blue-400 transition-colors">
        <span class="sr-only">Email</span>
        <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z">
            </path>
        </svg>
    </a>`;
}

export function renderSocialLinksHTML(resumeData: ResumeData): string {
    return `
        <!-- LinkedIn -->
        <a href="${resumeData.contact.linkedIn}" target="_blank" rel="me noopener noreferrer"
            class="text-slate-400 hover:text-blue-400 transition-colors">
            <span class="sr-only">LinkedIn</span>
            <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
        </a>
        <!-- GitHub -->
        <a href="${resumeData.contact.github}" target="_blank" rel="me noopener noreferrer"
            class="text-slate-400 hover:text-blue-400 transition-colors">
            <span class="sr-only">GitHub</span>
            <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" clip-rule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
        </a>
    `;
}

export function renderContactHTML(resumeData: ResumeData): string {
    return `
        <div class="text-center">
            <h4 class="text-2xl font-bold text-white mb-6">Get in Touch</h4>
            <p class="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                I would love to chat with you on technical leadership – from distributed systems architecture to organizational engineering standards.
            </p>
            <div class="flex flex-row justify-center items-center gap-x-6 sm:gap-x-10 flex-nowrap overflow-x-auto pb-4 scrollbar-hide">
                <!-- Email Reveal -->
                <button id="reveal-email-contact" class="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer group shrink-0" data-e="${btoa(resumeData.contact.email)}">
                    <svg class="h-8 w-8 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    <span class="font-medium">Email</span>
                </button>

                <!-- Phone Reveal -->
                <button id="reveal-phone-contact" class="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer group shrink-0" data-p="${btoa(resumeData.contact.phone)}">
                    <svg class="h-8 w-8 text-slate-400 group-hover:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    <span class="font-medium">Phone</span>
                </button>

                <!-- LinkedIn -->
                <a href="${resumeData.contact.linkedIn}" target="_blank" rel="me noopener noreferrer"
                    class="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors group shrink-0">
                    <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path
                            d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    <span class="font-medium text-slate-300 group-hover:text-blue-400">LinkedIn</span>
                </a>

                <!-- GitHub -->
                <a href="${resumeData.contact.github}" target="_blank" rel="me noopener noreferrer"
                    class="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors group shrink-0">
                    <svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span class="font-medium text-slate-300 group-hover:text-blue-400">GitHub</span>
                </a>
            </div>
        </div>
    `;
}
