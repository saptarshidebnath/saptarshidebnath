import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// Colors replacement map for light to dark
const replacements = [
    [/bg-gray-50/g, 'bg-slate-950'],
    [/text-gray-900/g, 'text-slate-50'],
    [/bg-white\/80/g, 'bg-slate-900/80'],
    [/border-gray-200/g, 'border-slate-800'],
    [/text-gray-500/g, 'text-slate-400'],
    [/from-gray-50/g, 'from-slate-950'],
    [/to-gray-200/g, 'to-slate-900'],
    [/text-gray-600/g, 'text-slate-300'],
    [/bg-white/g, 'bg-slate-900'],
    [/border-gray-100/g, 'border-slate-800'],
    [/border-gray-300/g, 'border-slate-700'],
    [/text-gray-700/g, 'text-slate-200'],
    [/bg-blue-100/g, 'bg-blue-900/30'],
    [/text-blue-600/g, 'text-blue-400'],
    [/text-gray-400/g, 'text-slate-400'],
    [/hover:bg-gray-50/g, 'hover:bg-slate-800'],
    [/bg-blue-900/g, 'bg-slate-950'],
    [/text-blue-900/g, 'text-white'],
    [/hover:bg-gray-100/g, 'hover:bg-blue-700'],
];

replacements.forEach(([regex, repl]) => {
    html = html.replace(regex, repl);
});

// Fix coaching section specifically where button was white background, changed to blue
html = html.replace('bg-slate-900 hover:bg-blue-700', 'bg-blue-600 hover:bg-blue-700 border-transparent');

// Also update the meta theme color if we want to add it
if (!html.includes('theme-color')) {
    html = html.replace('</head>', '    <meta name="theme-color" content="#0f172a" />\n</head>');
}

fs.writeFileSync('index.html', html);

// Update TS rendering logic colors
let ts = fs.readFileSync('src/main.ts', 'utf8');
const tsReplacements = [
    [/text-gray-900/g, 'text-white'],
    [/text-gray-500/g, 'text-slate-400'],
    [/text-gray-700/g, 'text-slate-300'],
    [/border-gray-200/g, 'border-slate-800'],
    [/text-gray-400/g, 'text-slate-400'],
    [/bg-blue-50/g, 'bg-blue-900/30'],
    [/text-blue-700/g, 'text-blue-300'],
    [/text-gray-600/g, 'text-slate-400'],
    [/text-blue-600/g, 'text-blue-400'],
];

tsReplacements.forEach(([regex, repl]) => {
    ts = ts.replace(regex, repl);
});

fs.writeFileSync('src/main.ts', ts);

console.log("Updated to dark theme.");
