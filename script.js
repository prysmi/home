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

    // Function to update Three.js colors based on theme
    function updateThreeJSColors() {
        const isLightMode = document.body.classList.contains('light-mode');
        const bgColor = isLightMode ? 0xF5F5F5 : 0x0A0A0A; // Light mode background or dark mode
        renderer.setClearColor(bgColor, 1);

        // Adjust particle colors based on theme
        const paletteLight = [new THREE.Color("#FF53AC"), new THREE.Color("#333333")]; // Pink and dark gray for light mode
        const paletteDark = [new THREE.Color("#FF53AC"), new THREE.Color("#FFFFFF")]; // Pink and white for dark mode

        const currentPalette = isLightMode ? paletteLight : paletteDark;

        if (particleSystem) { // Ensure particleSystem exists before updating
            const colorsArray = particleSystem.geometry.attributes.color.array;
            const positionsArray = particleSystem.geometry.attributes.position.array; // To access positions for consistent color assignment

            for (let i = 0; i < dotCount; i++) {
                // Re-assign colors based on the new palette
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
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3)); // Initialize with empty colors, will be filled by updateThreeJSColors

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);

    camera.position.z = 15;
    camera.position.y = 5;
    camera.lookAt(scene.position);

    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('touchstart', onDocumentTouchStart, { passive: false });
    document.addEventListener('touchmove', onDocumentTouchMove, { passive: false });


    function onDocumentMouseMove(event) {
        mouseX = (event.clientX - windowHalfX) * 0.01;
        mouseY = (event.clientY - windowHalfY) * 0.01;
    }

    function onDocumentTouchStart(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            mouseX = (event.touches[0].pageX - windowHalfX) * 0.015;
            mouseY = (event.touches[0].pageY - windowHalfY) * 0.015;
        }
    }

    function onDocumentTouchMove(event) {
        if (event.touches.length === 1) {
            event.preventDefault();
            mouseX = (event.touches[0].pageX - windowHalfX) * 0.015;
            mouseY = (event.touches[0].pageY - windowHalfY) * 0.015;
        }
    }

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        const positionsArray = particleSystem.geometry.attributes.position.array;
        const colorsArray = particleSystem.geometry.attributes.color.array;

        for (let i = 0; i < dotCount; i++) {
            const x = positionsArray[i * 3];
            const z = positionsArray[i * 3 + 2];

            const yWave = Math.sin(x * waveFrequency + time) * waveAmplitude * 0.5 +
                          Math.cos(z * waveFrequency * 0.7 + time * 0.8) * waveAmplitude * 0.5;
            positionsArray[i * 3 + 1] = yWave;

            // Re-assign colors based on the new palette on a timed interval for subtle animation
            // This ensures colors update with theme changes and also have subtle shifts
            if (Math.floor(time * 10) % 120 === i % 120) {
                const isLightMode = document.body.classList.contains('light-mode');
                const palette = isLightMode ? [new THREE.Color("#FF53AC"), new THREE.Color("#333333")] : [new THREE.Color("#FF53AC"), new THREE.Color("#FFFFFF")];
                const color = palette[Math.floor(Math.random() * palette.length)];
                colorsArray[i * 3] = color.r;
                colorsArray[i * 3 + 1] = color.g;
                colorsArray[i * 3 + 2] = color.b;
            }
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
        particleSystem.geometry.attributes.color.needsUpdate = true;

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

    // Expose update function for theme changes
    window.updateThreeJSColors = updateThreeJSColors;
}

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle functionality
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }


    // Close mobile menu when a link is clicked
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu) { // Add null check for mobileMenu
                mobileMenu.classList.add('hidden');
            }
        });
    });

    // Dynamically set the current year in the footer
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // Navigation active state logic
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    function changeNav(targetId) {
        navLinks.forEach(link => {
            link.classList.remove('active', 'next-steps-active-style');
            // Check if the link is a button, if so, skip active class for scroll
            if (link.tagName === 'A' && link.getAttribute('href') === `#${targetId}`) {
                link.classList.add('active');
                if (targetId === 'next-steps') {
                    link.classList.add('next-steps-active-style');
                }
            }
        });
    }
    // Changed threshold to 0.1 for more sensitive highlighting
    const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { changeNav(entry.target.id); } });
    }, observerOptions);
    sections.forEach(section => { observer.observe(section); });


    // Animation for elements on scroll (fade-in-up)
    const animateOnScrollElements = document.querySelectorAll('.fade-in-up');
    const observerOptionsAnimate = { root: null, rootMargin: "0px", threshold: 0.1 };
    const animateObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, observerOptionsAnimate);
    animateOnScrollElements.forEach(element => { animateObserver.observe(element); });

    // Floating header on scroll
    const mainHeader = document.getElementById('main-header');
    const scrollThreshold = 50; // Pixels scrolled before header changes
    window.addEventListener('scroll', () => {
        if (mainHeader) { // Add null check for mainHeader
            if (window.scrollY > scrollThreshold) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }
    });

    // Call the Three.js initialization function here
    initializeThreeJSBackground();

    // --- Calendly Integration ---
    const calendlyLink = "https://calendly.com/prabhjot-prysmi";

    // Buttons to open Calendly
    const getStartedHeaderBtn = document.getElementById('get-started-header-btn');
    const getStartedMobileBtn = document.getElementById('get-started-mobile-btn');
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const scheduleCallFooterBtn = document.getElementById('schedule-call-footer-btn');

    // Function to redirect to Calendly
    function redirectToCalendly() {
        window.open(calendlyLink, '_blank'); // Open in a new tab
    }

    // Event listeners for Calendly buttons
    if (getStartedHeaderBtn) getStartedHeaderBtn.addEventListener('click', redirectToCalendly);
    if (getStartedMobileBtn) getStartedMobileBtn.addEventListener('click', redirectToCalendly);
    if (heroCtaBtn) heroCtaBtn.addEventListener('click', redirectToCalendly);
    if (scheduleCallFooterBtn) scheduleCallFooterBtn.addEventListener('click', redirectToCalendly);

    // --- Back to Top Button Functionality ---
    const backToTopButton = document.getElementById('back-to-top');

    window.addEventListener('scroll', () => {
        if (backToTopButton) { // Add null check for backToTopButton
            if (window.scrollY > 300) { // Show button after scrolling 300px
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        }
    });

    if (backToTopButton) { // Add null check for backToTopButton
        backToTopButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Smooth scroll to top
            });
        });
    }


    // --- Theme Toggle Functionality ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const footerLogo = document.getElementById('footer-logo');

    // Select the span that will hold the symbol
    // Corrected: Removed `.btn` as `themeToggleBtn` is already the button element.
    const desktopThemeSymbol = themeToggleBtn ? themeToggleBtn.querySelector('.theme-symbol') : null;

    // Function to set the theme
    function setTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-mode');
            // When setting to light mode, the button should display "Dark Mode" (moon symbol) to suggest switching to dark.
            if (desktopThemeSymbol) desktopThemeSymbol.textContent = '☾';
            if (footerLogo) footerLogo.src = 'https://raw.githubusercontent.com/prysmi/home/main/Black%20Horizontal%20Logo%20TM.png';
        } else {
            document.body.classList.remove('light-mode');
            // When setting to dark mode, the button should display "Light Mode" (sun symbol) to suggest switching to light.
            if (desktopThemeSymbol) desktopThemeSymbol.textContent = '☀';
            if (footerLogo) footerLogo.src = 'https://raw.githubusercontent.com/prysmi/home/main/White%20Horizontal%20Logo%20TM.png';
        }
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        // Update Three.js colors after theme change
        if (window.updateThreeJSColors) {
            window.updateThreeJSColors();
        }
    }

    // Check for saved theme preference on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme(true);
    } else {
        setTheme(false); // Default to dark mode if no preference or 'dark'
    }

    // Event listener for theme toggle button (desktop)
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLightMode = document.body.classList.contains('light-mode');
            setTheme(!isLightMode);
        });
    }
});
