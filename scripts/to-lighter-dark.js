import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// Colors replacement map for very dark to lighter dark
const replacements = [
    [/bg-slate-950/g, 'bg-slate-800'],
    [/bg-slate-900\/80/g, 'bg-slate-800/80'],
    [/bg-slate-900/g, 'bg-slate-700'],
    [/border-slate-800/g, 'border-slate-600'],
    [/border-slate-700/g, 'border-slate-500'],
    [/from-slate-950/g, 'from-slate-800'],
    [/to-slate-900/g, 'to-slate-700'],
    [/hover:bg-slate-800/g, 'hover:bg-slate-600'],
    [/bg-blue-900\/30/g, 'bg-blue-800/40'],
];

replacements.forEach(([regex, repl]) => {
    html = html.replace(regex, repl);
});

// Update the meta theme color
html = html.replace('<meta name="theme-color" content="#0f172a" />', '<meta name="theme-color" content="#1e293b" />');

fs.writeFileSync('index.html', html);

// Update TS rendering logic colors
let ts = fs.readFileSync('src/main.ts', 'utf8');
const tsReplacements = [
    [/bg-slate-950/g, 'bg-slate-800'],
    [/bg-slate-900/g, 'bg-slate-700'],
    [/border-slate-800/g, 'border-slate-600'],
    [/bg-blue-900\/30/g, 'bg-blue-800/40'],
];

tsReplacements.forEach(([regex, repl]) => {
    ts = ts.replace(regex, repl);
});

fs.writeFileSync('src/main.ts', ts);

console.log("Updated to lighter dark theme.");
