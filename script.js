// REFACTORED: All code is now wrapped in a DOMContentLoaded listener.
// This is a best practice to ensure all HTML elements are loaded before the script tries to access them.
document.addEventListener('DOMContentLoaded', () => {

    // --- Three.js Waving Dots Background Animation Script ---
    function initializeThreeJSBackground() {
        const canvas = document.getElementById('waving-dots-3d-background');
        if (!canvas) {
            console.error("3D waving dots canvas not found!");
            document.body.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--color-bg-body');
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);

        let particleSystem; // Define particleSystem here to be accessible within the scope

        // This function is now defined within the same scope, so it can be called directly by setTheme
        function updateThreeJSColors() {
            const isLightMode = document.body.classList.contains('light-mode');
            const bgColor = isLightMode ? 0xF5F5F5 : 0x0A0A0A;
            renderer.setClearColor(bgColor, 1);

            const paletteLight = [new THREE.Color("#FF53AC"), new THREE.Color("#333333")];
            const paletteDark = [new THREE.Color("#FF53AC"), new THREE.Color("#FFFFFF")];
            const currentPalette = isLightMode ? paletteLight : paletteDark;

            if (particleSystem) {
                const colorsArray = particleSystem.geometry.attributes.color.array;
                for (let i = 0; i < dotCount; i++) {
                    const color = currentPalette[Math.floor(Math.random() * currentPalette.length)];
                    colorsArray[i * 3] = color.r;
                    colorsArray[i * 3 + 1] = color.g;
                    colorsArray[i * 3 + 2] = color.b;
                }
                particleSystem.geometry.attributes.color.needsUpdate = true;
            }
        }

        const dotCount = 15000;
        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(dotCount * 3);
        const colorsAttribute = new Float32Array(dotCount * 3);
        const waveAmplitude = 2;
        const waveFrequency = 0.2;
        const planeSize = 40;

        for (let i = 0; i < dotCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * planeSize;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = (Math.random() - 0.5) * planeSize;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
        scene.add(particleSystem);

        camera.position.z = 15;
        camera.position.y = 5;
        camera.lookAt(scene.position);

        let mouseX = 0, mouseY = 0;
        let targetRotationX = 0, targetRotationY = 0;
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX - windowHalfX) * 0.01;
            mouseY = (event.clientY - windowHalfY) * 0.01;
        });

        document.addEventListener('touchstart', (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                mouseX = (event.touches[0].pageX - windowHalfX) * 0.015;
                mouseY = (event.touches[0].pageY - windowHalfY) * 0.015;
            }
        }, { passive: false });

        document.addEventListener('touchmove', (event) => {
            if (event.touches.length === 1) {
                event.preventDefault();
                mouseX = (event.touches[0].pageX - windowHalfX) * 0.015;
                mouseY = (event.touches[0].pageY - windowHalfY) * 0.015;
            }
        }, { passive: false });

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            const positionsArray = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < dotCount; i++) {
                const x = positionsArray[i * 3];
                const z = positionsArray[i * 3 + 2];
                positionsArray[i * 3 + 1] = Math.sin(x * waveFrequency + time) * waveAmplitude * 0.5 + Math.cos(z * waveFrequency * 0.7 + time * 0.8) * waveAmplitude * 0.5;
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;

            targetRotationX = mouseY * 0.2;
            targetRotationY = mouseX * 0.2;
            camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.05;
            camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.05;

            const boundingBox = new THREE.Box3().setFromObject(particleSystem);
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            camera.lookAt(center);

            renderer.render(scene, camera);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);

        updateThreeJSColors(); // Initial color setup
        animate(); // Start Three.js animation
    }

    // --- Theme Toggle Functionality ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const footerLogo = document.getElementById('footer-logo');
    const desktopThemeSymbol = themeToggleBtn ? themeToggleBtn.querySelector('.theme-symbol') : null;

    function setTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            if (desktopThemeSymbol) desktopThemeSymbol.textContent = '☾';
            if (footerLogo) footerLogo.src = 'https://raw.githubusercontent.com/prysmi/home/refs/heads/main/assets/trademarks/logos/Black%20Horizontal%20Logo%20TM.webp';
        } else {
            document.body.classList.remove('light-mode');
            if (desktopThemeSymbol) desktopThemeSymbol.textContent = '☀';
            if (footerLogo) footerLogo.src = 'https://raw.githubusercontent.com/prysmi/home/refs/heads/main/assets/trademarks/logos/White%20Horizontal%20Logo%20TM.webp';
        }
        localStorage.setItem('theme', isLight ? 'light' : 'dark');

        // REFACTORED: Directly call the update function, which is now in the same scope.
        // This is only called if the 3D canvas exists.
        if (document.getElementById('waving-dots-3d-background')) {
            initializeThreeJSBackground.updateThreeJSColors();
        }
    }

    // Initialize the theme toggle and check for saved preference
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLightMode = document.body.classList.contains('light-mode');
            setTheme(!isLightMode);
        });
    }

    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'light');


    // --- Other Initializations ---

    // Initialize 3D Background if canvas exists
    if (document.getElementById('waving-dots-3d-background')) {
        initializeThreeJSBackground();
    }

    // Mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
        });
    }

    // Dynamically set the current year in the footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Back to Top Button Functionality
    const backToTopButton = document.getElementById('back-to-top');
    if (backToTopButton) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Calendly Integration
    const calendlyLink = "https://calendly.com/prabhjot-prysmi";
    const calendlyButtons = document.querySelectorAll('#get-started-header-btn, #get-started-mobile-btn, #hero-cta-btn, #schedule-call-footer-btn');
    calendlyButtons.forEach(button => {
        button.addEventListener('click', () => window.open(calendlyLink, '_blank'));
    });

    // Animation for elements on scroll (fade-in-up)
    const animateOnScrollElements = document.querySelectorAll('.fade-in-up');
    const animateObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animateOnScrollElements.forEach(element => animateObserver.observe(element));
});

