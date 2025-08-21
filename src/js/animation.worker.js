// src/js/animation.worker.js
import { Scene, PerspectiveCamera, WebGLRenderer, BufferGeometry, Float32BufferAttribute, PointsMaterial, Points, Color } from 'three';

// --- Configuration Constants ---
const SPREAD = 40;
const PARTICLE_SIZE = 0.08;
const WAVE_SPEED = 0.001; // Slower speed can feel more natural
const WAVE_FREQUENCY = 0.2;
const PARTICLE_COUNT_MOBILE = 5000;
const PARTICLE_COUNT_DESKTOP = 12000;
// --- End of Configuration ---

let renderer, scene, camera, particleSystem;
let isLightMode = false;

function init(data) {
    try {
        const { canvas, width, height, pixelRatio, theme } = data;
        isLightMode = theme === 'light';

        scene = new Scene();
        camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
        renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false); // `false` prevents the renderer from overriding canvas style

        const dotCount = width < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
        const particlesGeometry = new BufferGeometry();
        const positions = new Float32Array(dotCount * 3);

        for (let i = 0; i < positions.length; i++) {
            positions[i] = (Math.random() - 0.5) * SPREAD;
        }

        particlesGeometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new Float32BufferAttribute(new Float32Array(dotCount * 3), 3));

        const particleMaterial = new PointsMaterial({ size: PARTICLE_SIZE, vertexColors: true, transparent: true, opacity: 0.8 });
        particleSystem = new Points(particlesGeometry, particleMaterial);
        scene.add(particleSystem);

        camera.position.set(0, 5, 15);
        camera.lookAt(scene.position);

        updateColors();
        animate();
    } catch (error) {
        console.error("Three.js worker initialization failed:", error);
    }
}

function updateColors() {
    if (!renderer || !particleSystem) return;

    renderer.setClearColor(isLightMode ? 0xF5F5F5 : 0x0A0A0A, 1);
    const colorsArray = particleSystem.geometry.attributes.color.array;
    const palette = isLightMode
        ? [new Color("#FF53AC"), new Color("#333333")]
        : [new Color("#FF53AC"), new Color("#FFFFFF")];

    for (let i = 0; i < colorsArray.length; i += 3) {
        const color = palette[Math.floor(Math.random() * palette.length)];
        color.toArray(colorsArray, i);
    }
    particleSystem.geometry.attributes.color.needsUpdate = true;
}

function animate() {
    if (!renderer) return;
    requestAnimationFrame(animate);

    const time = performance.now() * WAVE_SPEED;
    const positionsArray = particleSystem.geometry.attributes.position.array;
    const dotCount = positionsArray.length / 3;

    for (let i = 0; i < dotCount; i++) {
        const x = positionsArray[i * 3];
        const z = positionsArray[i * 3 + 2];
        positionsArray[i * 3 + 1] = Math.sin(x * WAVE_FREQUENCY + time) + Math.cos(z * WAVE_FREQUENCY + time);
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}

self.onmessage = function (e) {
    if (e.data.canvas) {
        init(e.data); // The whole initial data packet
    } else if (e.data.theme) {
        isLightMode = e.data.theme === 'light';
        updateColors();
    } else if (e.data.resize) {
        if (camera && renderer) {
            camera.aspect = e.data.resize.width / e.data.resize.height;
            camera.updateProjectionMatrix();
            renderer.setSize(e.data.resize.width, e.data.resize.height, false);
        }
    }
};
