document.addEventListener('DOMContentLoaded', () => {

  // ---------------- Three.js Background ----------------
  function initializeThreeJSBackground() {
    const canvas = document.getElementById('waving-dots-3d-background');
    if (!canvas || !window.THREE) {
      console.warn('Three.js not available');
      document.body.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--color-bg-body');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const dotCount = 15000;
    const positions = new Float32Array(dotCount * 3);
    const colorsArray = new Float32Array(dotCount * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3));

    const waveAmp = 2, waveFreq = 0.2, planeSize = 40;

    for (let i = 0; i < dotCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * planeSize;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * planeSize;
    }

    const mat = new THREE.PointsMaterial({ size: 0.08, vertexColors: true, transparent: true, opacity: 0.8 });
    const particleSystem = new THREE.Points(geo, mat);
    scene.add(particleSystem);

    camera.position.set(0, 5, 15);

    let mouseX = 0, mouseY = 0, tRotX = 0, tRotY = 0;
    const halfX = window.innerWidth / 2, halfY = window.innerHeight / 2;

    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX - halfX) * 0.01;
      mouseY = (e.clientY - halfY) * 0.01;
    });

    const updateThreeJSColors = () => {
      const isLight = document.body.classList.contains('light-mode');
      const palette = isLight
        ? [new THREE.Color("#FF53AC"), new THREE.Color("#333333")]
        : [new THREE.Color("#FF53AC"), new THREE.Color("#FFFFFF")];
      renderer.setClearColor(isLight ? 0xF5F5F5 : 0x0A0A0A, 1);
      for (let i = 0; i < dotCount; i++) {
        const c = palette[Math.floor(Math.random() * palette.length)];
        colorsArray[i * 3] = c.r;
        colorsArray[i * 3 + 1] = c.g;
        colorsArray[i * 3 + 2] = c.b;
      }
      geo.attributes.color.needsUpdate = true;
    };

    let time = 0;
    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;
      const posArr = geo.attributes.position.array;
      for (let i = 0; i < dotCount; i++) {
        const x = posArr[i * 3], z = posArr[i * 3 + 2];
        posArr[i * 3 + 1] = Math.sin(x * waveFreq + time) * waveAmp * 0.5 +
                            Math.cos(z * waveFreq * 0.7 + time * 0.8) * waveAmp * 0.5;
      }
      geo.attributes.position.needsUpdate = true;
      tRotX = mouseY * 0.2;
      tRotY = mouseX * 0.2;
      camera.rotation.x += (tRotX - camera.rotation.x) * 0.05;
      camera.rotation.y += (tRotY - camera.rotation.y) * 0.05;
      renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    updateThreeJSColors();
    animate();
    window.updateThreeJSColors = updateThreeJSColors;
  }

  // ---------------- Mobile Drawer + Focus Trap ----------------
  const miniNav = document.getElementById('mobile-mini-nav');
  const drawer = document.getElementById('mobile-drawer');
  const drawerClose = document.getElementById('mobile-drawer-close');
  const drawerLinks = document.querySelectorAll('.drawer-links a, .drawer-links button');
  let lastFocus = null, trapHandler;

  const getFocusable = c => Array.from(c.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'));
  const trapFocus = el => {
    const fEls = getFocusable(el);
    const first = fEls[0], last = fEls[fEls.length - 1];
    trapHandler = e => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      if (e.key === 'Escape') closeDrawer();
    };
    el.addEventListener('keydown', trapHandler);
  };

  const openDrawer = () => {
    lastFocus = document.activeElement;
    drawer.hidden = false;
    drawer.setAttribute('aria-hidden', 'false');
    if (miniNav) miniNav.hidden = true;
    trapFocus(drawer);
    getFocusable(drawer)[0]?.focus();
  };
  const closeDrawer = () => {
    drawer.hidden = true;
    drawer.setAttribute('aria-hidden', 'true');
    if (miniNav) miniNav.hidden = false;
    drawer.removeEventListener('keydown', trapHandler);
    lastFocus?.focus();
  };

  miniNav?.addEventListener('click', openDrawer);
  drawerClose?.addEventListener('click', closeDrawer);
  drawerLinks.forEach(l => l.addEventListener('click', closeDrawer));

  // ---------------- Footer Year ----------------
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------------- Active Nav Highlight ----------------
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const changeNav = id => {
    navLinks.forEach(link => {
      link.classList.remove('active', 'next-steps-active-style');
      if (link.getAttribute('href') === `#${id}`) {
        link.classList.add('active');
        if (id === 'next-steps') link.classList.add('next-steps-active-style');
      }
    });
  };
  const sectionObserver = new IntersectionObserver(es => {
    es.forEach(e => e.isIntersecting && changeNav(e.target.id));
  }, { threshold: 0.1 });
  sections.forEach(s => sectionObserver.observe(s));

  // ---------------- Fade In On Scroll ----------------
  document.querySelectorAll('.fade-in-up').forEach(el =>
    new IntersectionObserver(es => {
      es.forEach(e => e.isIntersecting && e.target.classList.add('is-visible'));
    }, { threshold: 0.1 }).observe(el)
  );

  // ---------------- Header Scroll State ----------------
  const head = document.getElementById('main-header');
  window.addEventListener('scroll', () => head?.classList.toggle('scrolled', window.scrollY > 50));

  // ---------------- Calendly Buttons ----------------
  const calURL = "https://calendly.com/prabhjot-prysmi";
  ['get-started-header-btn', 'drawer-get-started', 'hero-cta-btn', 'schedule-call-footer-btn']
    .forEach(id => document.getElementById(id)?.addEventListener('click', () => window.open(calURL, '_blank')));

  // ---------------- Back to Top ----------------
  const btt = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btt?.classList.toggle('show', window.scrollY > 300));
  btt?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // ---------------- Theme Toggle ----------------
  const tBtn = document.getElementById('theme-toggle');
  const tSymbol = tBtn?.querySelector('.theme-symbol');
  const logo = document.getElementById('footer-logo');
  const setTheme = light => {
    document.body.classList.toggle('light-mode', light);
    if (tSymbol) tSymbol.textContent = light ? '☾' : '☀';
    if (logo) logo.src = light
      ? 'https://raw.githubusercontent.com/prysmi/home/refs/heads/main/assets/trademarks/logos/Black%20Horizontal%20Logo%20TM.webp'
      : 'https://raw.githubusercontent.com/prysmi/home/refs/heads/main/assets/trademarks/logos/White%20Horizontal%20Logo%20TM.webp';
    localStorage.setItem('theme', light ? 'light' : 'dark');
    window.updateThreeJSColors?.();
  };
  setTheme(localStorage.getItem('theme') === 'light');
  tBtn?.addEventListener('click', () => setTheme(!document.body.classList.contains('light-mode')));

  // Init background
  initializeThreeJSBackground();
});
