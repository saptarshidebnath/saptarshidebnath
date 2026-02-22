import * as THREE from 'three';

/**
 * Three.js 3D Glowing Particle Sea Wave.
 * Provides a stunning but subtle "wow factor" that isn't overwhelming.
 * Respects `prefers-reduced-motion`.
 */
export function initWebGL() {
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Check for accessibility preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        return;
    }

    const scene = new THREE.Scene();
    // Neutral dark background for Soft Minimalist
    scene.fog = new THREE.FogExp2(0x171717, 0.003);

    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 1, 1000);
    // Position camera dynamically looking across the "sea"
    camera.position.set(0, 25, 60);
    camera.lookAt(0, -10, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Create Particle Grid Geometry
    const SEPARATION = 3.5;
    const AMOUNTX = 100;
    const AMOUNTY = 100;

    // Total number of particles
    const numParticles = AMOUNTX * AMOUNTY;
    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);
    const colors = new Float32Array(numParticles * 3);

    const colorObj = new THREE.Color();

    let i = 0, j = 0;
    for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
            // x, y, z positions
            positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
            positions[i + 1] = 0; // y (will be animated)
            positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z

            scales[j] = 1;

            i += 3;
            j++;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Shader Material for glowing particles
    const material = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xffffff) },
            globalAlpha: { value: 0.0 }
        },
        vertexShader: `
            attribute float scale;
            attribute vec3 color;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = scale * (50.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform float globalAlpha;
            varying vec3 vColor;
            void main() {
                vec2 xy = gl_PointCoord.xy - vec2(0.5);
                float ll = length(xy);
                if (ll > 0.5) discard;
                float alpha = (0.5 - ll) * 2.0; 
                gl_FragColor = vec4(color * vColor, alpha * 0.8 * globalAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let count = 0;
    let time = 0;
    const startTime = performance.now();

    function animate() {
        requestAnimationFrame(animate);

        const posAttr = particles.geometry.attributes.position;
        const scaleAttr = particles.geometry.attributes.scale;
        const colorAttr = particles.geometry.attributes.color;
        if (!posAttr || !scaleAttr || !colorAttr) return;

        const positions = posAttr.array as Float32Array;
        const scales = scaleAttr.array as Float32Array;
        const colors = colorAttr.array as Float32Array;

        const intensity = 0.6 + Math.sin(time * 0.1) * 0.4;

        let i = 0, j = 0;

        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i + 1] = (
                    (Math.sin((ix + count) * 0.2) * 4) +
                    (Math.sin((iy + count) * 0.3) * 4) +
                    (Math.cos((ix + iy + count * 2) * 0.1) * 2)
                ) * intensity;

                scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 3 +
                    (Math.sin((iy + count) * 0.5) + 1) * 3;

                const percentX = ix / AMOUNTX;
                // Restore dynamic hue shifting (rainbow effect)
                let hue = (count * 0.05 + percentX * 0.1) % 1.0;

                colorObj.setHSL(hue, 0.8, 0.6);
                colors[i] = colorObj.r;
                colors[i + 1] = colorObj.g;
                colors[i + 2] = colorObj.b;

                i += 3;
                j++;
            }
        }

        posAttr.needsUpdate = true;
        scaleAttr.needsUpdate = true;
        colorAttr.needsUpdate = true;

        const elapsedTime = (performance.now() - startTime) / 1000;
        const t = Math.min(elapsedTime / 10.0, 1.0);
        const targetAlpha = t * t * t;

        if (material.uniforms.globalAlpha) {
            material.uniforms.globalAlpha.value = targetAlpha;
        }

        particles.rotation.y = Math.sin(count * 0.02) * 0.02;

        time += 0.01;
        count += 0.005;

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    window.addEventListener('resize', onWindowResize);
    animate();
}
