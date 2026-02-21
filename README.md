# Saptarshi Debnath - Portfolio & Resume

A premium, high-performance portfolio website architected for technical precision and SEO excellence. This project is a data-driven Single Page Application (SPA) designed to showcase Staff-level engineering impact.

## 🚀 Key Features

- **Decoupled Architecture**: 100% of the site content (Hero, Resume, Projects, Contact) is externalized into a single `resume.json` "Policy" file.
- **Dedicated Rendering Engine**: A custom TypeScript rendering module (`src/render-engine.ts`) handles the "Mechanism" of transforming JSON data into semantic, SEO-ready HTML.
- **Dynamic SEO**: Intelligent metadata injection that syncs page titles and social preview descriptions with the live resume summary.
- **Premium Aesthetics**: 
  - 3D Glowing Particle Wave background (WebGL/Three.js).
  - Glassmorphic UI components with smooth transitions.
  - Zero "Flash of Unstyled Content" (FOUC) thanks to a custom hydration cloak and inline theme styling.
- **Print-Optimized**: High-fidelity CSS print styles tailored for professional PDF generation.

## 🛠 Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) (Build System / Dev Server)
- **Logic**: TypeScript
- **Styling**: Tailwind CSS & SCSS
- **Graphics**: [Three.js](https://threejs.org/) (WebGL)
- **PDF Generation**: Puppeteer (via custom scripts)

## 📁 Project Structure

```text
├── data/
│   └── resume.json       # The "Single Source of Truth" for all content
├── src/
│   ├── render-engine.ts  # The rendering engine (HTML generation logic)
│   ├── main.ts           # Application Controller (Routing, Hydration, SEO)
│   ├── webgl.ts          # 3D Background implementation
│   └── style.scss        # Design system and custom theme tokens
├── index.html            # Main SPA shell with SEO fallbacks
└── public/               # Static assets (PDFs, images)
```

## 💻 Getting Started

### Development
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Build & Deploy
```bash
# Generate production bundle & PDF
npm run build

# Preview build
npm run preview
```

## 🌐 Deployment (Zero-Cost)

This project is configured for **GitHub Pages** with **GitHub Actions**.

1. **Push to GitHub**: Simply push your changes to the `main` branch.
2. **Auto-Deploy**: A GitHub Action (`.github/workflows/deploy.yml`) will automatically:
   - Build the site.
   - Generate the latest PDF resume using Puppeteer.
   - Deploy the result to the `gh-pages` branch.
3. **Routing**: The site includes a `404.html` redirect hack to support SPA routing (e.g., refreshing on `/resume` will work perfectly).

### Option B: Manual Deployment (Local)
If you prefer to deploy from your local machine:
```bash
npm run deploy
```
This script will build the site, generate the PDF, and push the `dist` folder to your `gh-pages` branch.

> [!NOTE]
> GitHub Actions provides 2,000 free minutes per month, which is more than enough for hundreds of deployments. GitHub Pages is free for public repositories.

## ✍️ Customizing Content

To update the website, simply edit `data/resume.json`. 

The rendering engine automatically handles:
- **Date Filtering**: Jobs older than 10 years are automatically summarized into an "Earlier Career" section.
- **Contact Security**: Email and Phone numbers are obfuscated in the DOM and only revealed via user interaction to prevent crawler scraping.
- **Staff-Level Emphasis**: The site is optimized to highlight architectural strategy and organizational leadership.

---
