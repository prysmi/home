/*
        window.addEventListener('load', () => {
            function initializeThreeJSBackground() {
                const canvas = document.getElementById('waving-dots-3d-background');
                if (!canvas || !window.THREE) {
                    console.error("3D canvas or Three.js not found!");
                    if(canvas) canvas.style.display = 'none';
                    return;
                }
                
                try {
                    const scene = new THREE.Scene();
                    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
                    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
                    renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
                    renderer.setSize(window.innerWidth, window.innerHeight);

                    let particleSystem;

                    window.updateThreeJSColors = function() {
                        const isLightMode = document.body.classList.contains('light-mode');
                        renderer.setClearColor(isLightMode ? 0xF5F5F5 : 0x0A0A0A, 1);
                        if (particleSystem) {
                            const colorsArray = particleSystem.geometry.attributes.color.array;
                            const palette = isLightMode ? [new THREE.Color("#FF53AC"), new THREE.Color("#333333")] : [new THREE.Color("#FF53AC"), new THREE.Color("#FFFFFF")];
                            for (let i = 0; i < colorsArray.length; i += 3) {
                                const color = palette[Math.floor(Math.random() * palette.length)];
                                colorsArray[i] = color.r;
                                colorsArray[i + 1] = color.g;
                                colorsArray[i + 2] = color.b;
                            }
                            particleSystem.geometry.attributes.color.needsUpdate = true;
                        }
                    }

                    const dotCount = window.innerWidth < 768 ? 4000 : 12000;
                    const particlesGeometry = new THREE.BufferGeometry();
                    const positions = new Float32Array(dotCount * 3);
                    const colorsAttribute = new Float32Array(dotCount * 3);
                    for (let i = 0; i < dotCount * 3; i++) {
                        positions[i] = (Math.random() - 0.5) * 40;
                    }
                    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3));
                    const particleMaterial = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.8 });
                    particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
                    scene.add(particleSystem);

                    camera.position.set(0, 5, 15);
                    camera.lookAt(scene.position);

                    let time = 0;
                    function animate() {
                        requestAnimationFrame(animate);
                        time += 0.01;
                        const positionsArray = particleSystem.geometry.attributes.position.array;
                        for (let i = 0; i < dotCount; i++) {
                            const x = positionsArray[i * 3];
                            const z = positionsArray[i * 3 + 2];
                            positionsArray[i * 3 + 1] = Math.sin(x * 0.2 + time) + Math.cos(z * 0.2 + time);
                        }
                        particleSystem.geometry.attributes.position.needsUpdate = true;
                        renderer.render(scene, camera);
                    }

                    window.addEventListener('resize', () => {
                        camera.aspect = window.innerWidth / window.innerHeight;
                        camera.updateProjectionMatrix();
                        renderer.setSize(window.innerWidth, window.innerHeight);
                    }, false);

                    window.updateThreeJSColors();
                    animate();
                } catch (error) {
                    console.error("Three.js initialization failed:", error);
                    canvas.style.display = 'none';
                }
            }
            // A small delay to ensure the main thread is free
            setTimeout(initializeThreeJSBackground, 100);
        }); */

import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BufferGeometry,
    Float32BufferAttribute, // Note: BufferAttribute is now more specific
    PointsMaterial,
    Points,
    Color
} from 'three';

window.addEventListener('load', () => {
    function initializeThreeJSBackground() {
        // --- Configuration Constants ---
        const SPREAD = 40;
        const PARTICLE_SIZE = 0.08;
        const WAVE_SPEED = 0.01;
        const WAVE_FREQUENCY = 0.2;
        const PARTICLE_COUNT_MOBILE = 4000;
        const PARTICLE_COUNT_DESKTOP = 12000;
        // --- End of Configuration ---

        const canvas = document.getElementById('waving-dots-3d-background');
        // No longer need to check for window.THREE, as we import directly
        if (!canvas) {
            console.error("3D canvas not found!");
            return;
        }

        try {
            const scene = new Scene();
            const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            const renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
            
            renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1);
            renderer.setSize(window.innerWidth, window.innerHeight);

            let particleSystem;

            // This function remains globally accessible for your theme toggler
            window.updateThreeJSColors = function() {
                const isLightMode = document.body.classList.contains('light-mode');
                renderer.setClearColor(isLightMode ? 0xF5F5F5 : 0x0A0A0A, 1);

                if (particleSystem) {
                    const colorsArray = particleSystem.geometry.attributes.color.array;
                    const palette = isLightMode ? [new Color("#FF53AC"), new Color("#333333")] : [new Color("#FF53AC"), new Color("#FFFFFF")];
                    
                    for (let i = 0; i < colorsArray.length; i += 3) {
                        const color = palette[Math.floor(Math.random() * palette.length)];
                        color.toArray(colorsArray, i); // More efficient way to set colors
                    }
                    particleSystem.geometry.attributes.color.needsUpdate = true;
                }
            }

            const dotCount = window.innerWidth < 768 ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
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

            let time = 0;
            function animate() {
                requestAnimationFrame(animate);
                time += WAVE_SPEED;
                
                const positionsArray = particleSystem.geometry.attributes.position.array;
                for (let i = 0; i < dotCount; i++) {
                    const x = positionsArray[i * 3];
                    const z = positionsArray[i * 3 + 2];
                    positionsArray[i * 3 + 1] = Math.sin(x * WAVE_FREQUENCY + time) + Math.cos(z * WAVE_FREQUENCY + time);
                }
                particleSystem.geometry.attributes.position.needsUpdate = true;
                renderer.render(scene, camera);
            }

            window.addEventListener('resize', () => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            }, false);

            window.updateThreeJSColors();
            animate();
        } catch (error) {
            console.error("Three.js initialization failed:", error);
            if (canvas) canvas.style.display = 'none';
        }
    }
    
    // A small delay to ensure the main thread is free
    setTimeout(initializeThreeJSBackground, 100);
});
