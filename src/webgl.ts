/**
 * Canvas-based animated sea wave background.
 * Respects `prefers-reduced-motion`.
 */
export function initWebGL() {
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Check for accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        // Fallback for reduced motion (canvas is already styled with a gradient in CSS)
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let time = 0;

    class Wave {
        yOffsetRatio: number;
        amplitude: number;
        wavelength: number;
        speed: number;
        color: string;

        constructor(yOffsetRatio: number, amplitude: number, wavelength: number, speed: number, color: string) {
            this.yOffsetRatio = yOffsetRatio;
            this.amplitude = amplitude;
            this.wavelength = wavelength;
            this.speed = speed;
            this.color = color;
        }

        draw(ctx: CanvasRenderingContext2D, time: number, width: number, height: number) {
            ctx.beginPath();
            ctx.moveTo(0, height);

            const yOffset = height * this.yOffsetRatio;

            for (let x = 0; x <= width; x += 10) {
                // Primary rolling wave
                const y1 = Math.sin(x * this.wavelength + time * this.speed) * this.amplitude;
                // Secondary wave for organic texture
                const y2 = Math.cos(x * (this.wavelength * 2.5) + time * (this.speed * 1.5)) * (this.amplitude * 0.3);
                // Slowly shifting tertiary wave
                const y3 = Math.sin(x * (this.wavelength * 0.5) - time * (this.speed * 0.5)) * (this.amplitude * 0.4);

                ctx.lineTo(x, height - yOffset - y1 - y2 - y3);
            }

            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();

            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Material Design 3 inspired deep sea wave colors targeting a dark theme
    const waves = [
        new Wave(0.20, 40, 0.002, 0.015, 'rgba(15, 23, 42, 0.6)'),   // Slate 900
        new Wave(0.12, 50, 0.0015, 0.01, 'rgba(30, 58, 138, 0.4)'),   // Blue 900
        new Wave(0.02, 45, 0.001, 0.008, 'rgba(29, 78, 216, 0.2)')    // Blue 700
    ];

    function resize() {
        width = canvas.clientWidth;
        // Make the canvas slightly taller than its container so the waves don't get cut off randomly
        height = canvas.clientHeight;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx?.scale(dpr, dpr);
    }

    function animate() {
        if (!ctx) return;
        ctx.clearRect(0, 0, width, height);

        time += 1;

        // Draw waves back to front
        waves.forEach(wave => wave.draw(ctx, time, width, height));

        requestAnimationFrame(animate);
    }

    // Initialize
    window.addEventListener('resize', resize);
    resize();
    animate();
}
