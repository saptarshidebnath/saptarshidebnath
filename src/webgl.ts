/**
 * Ultra-light WebGL particles for the Hero background.
 * Respects `prefers-reduced-motion`.
 */
export function initWebGL() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    // Check for accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        // Fallback for reduced motion (canvas is already styled with a gradient in CSS)
        return;
    }

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Very simple, lightweight particle system
    const config = {
        particleCount: 50,
        baseSize: 1.5,
        baseSpeed: 0.2,
        colors: ['rgba(96, 165, 250, 0.4)', 'rgba(59, 130, 246, 0.3)', 'rgba(147, 197, 253, 0.5)']
    };

    function resize() {
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        // Fix for high DPI displays
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * config.baseSize + 0.5;
            this.speedX = (Math.random() - 0.5) * config.baseSpeed;
            this.speedY = (Math.random() - 0.5) * config.baseSpeed;
            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Loop around edges
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function drawLines() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(96, 165, 250, ${0.2 * (1 - distance / 150)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        drawLines();
        requestAnimationFrame(animate);
    }

    // Initialize
    window.addEventListener('resize', resize);
    resize();
    animate();
}
