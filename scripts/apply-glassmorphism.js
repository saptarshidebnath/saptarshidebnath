import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// Header
html = html.replace(
    'bg-slate-800/80 backdrop-blur-md z-50 border-b border-slate-600',
    'bg-[#0b1121]/80 backdrop-blur-md z-50 border-b border-white/10'
);

// Hero background
html = html.replace(
    'bg-gradient-to-br from-slate-800 to-slate-700',
    'bg-gradient-to-br from-[#0b1121] to-[#040814]'
);

// H1 Gradient
html = html.replace(
    'text-5xl md:text-7xl font-extrabold tracking-tight text-slate-50 bg-clip-text',
    'text-5xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-sm pb-2'
);

// Get in touch hero button
html = html.replace(
    'border border-slate-500 text-base font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600',
    'border border-white/20 text-base font-medium rounded-md text-white bg-white/5 hover:bg-white/10 backdrop-blur-md'
);

// About section
html = html.replace(
    'id="view-about"\n            class="spa-view hidden py-24 bg-slate-700 border-t border-slate-600 print:block print:py-8 transition-all duration-300 ease-in-out"',
    'id="view-about"\n            class="spa-view hidden py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl my-8 mx-4 sm:mx-8 shadow-2xl print:block print:py-8 transition-all duration-300 ease-in-out"'
);

// Resume Section
html = html.replace(
    'id="view-resume"\n            class="spa-view hidden py-24 bg-slate-800 border-t border-slate-600 print:block print:py-0 print:border-none transition-all duration-300 ease-in-out"',
    'id="view-resume"\n            class="spa-view hidden py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl my-8 mx-4 sm:mx-8 shadow-2xl print:block print:py-0 print:border-none transition-all duration-300 ease-in-out"'
);

// Download Resume button
html = html.replace(
    'border border-slate-500 shadow-sm text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600',
    'border border-white/20 shadow-sm text-sm font-medium rounded-md text-white bg-white/5 hover:bg-white/10 backdrop-blur-md'
);

// Resume Container
html = html.replace(
    'id="resume-container"\n                    class="bg-slate-700 rounded-xl shadow-sm border border-slate-600 p-8 md:p-12',
    'id="resume-container"\n                    class="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 md:p-12'
);

// System design section
html = html.replace(
    'id="view-system-design"\n            class="spa-view hidden py-24 bg-slate-700 border-t border-slate-600 print:hidden transition-all duration-300 ease-in-out"',
    'id="view-system-design"\n            class="spa-view hidden py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl my-8 mx-4 sm:mx-8 shadow-2xl print:hidden transition-all duration-300 ease-in-out"'
);

// System design grid item 1
html = html.replace(
    'class="p-8 bg-slate-800 rounded-2xl border border-slate-600 transition-shadow hover:shadow-md"',
    'class="p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl transition-all hover:bg-white/10 hover:shadow-xl hover:-translate-y-1 cursor-default"'
);

// Coaching section
html = html.replace(
    'id="view-coaching"\n            class="spa-view hidden py-24 bg-slate-800 text-white print:hidden transition-all duration-300 ease-in-out"',
    'id="view-coaching"\n            class="spa-view hidden py-24 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 border border-white/10 rounded-3xl my-8 mx-4 sm:mx-8 shadow-2xl text-white print:hidden transition-all duration-300 ease-in-out"'
);

// Contact section
html = html.replace(
    'id="view-contact"\n            class="spa-view hidden py-24 bg-slate-800 print:hidden transition-all duration-300 ease-in-out"',
    'id="view-contact"\n            class="spa-view hidden py-24 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl my-8 mx-4 sm:mx-8 shadow-2xl print:hidden transition-all duration-300 ease-in-out"'
);

fs.writeFileSync('index.html', html);
console.log("Applied glassmorphism.");
