// src/js/animation.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('waving-dots-3d-background');
    if (canvas && 'transferControlToOffscreen' in canvas && typeof Worker !== 'undefined') {
        try {
            const offscreenCanvas = canvas.transferControlToOffscreen();
            const worker = new Worker('animation.worker.bundle.js', { type: 'module' });

            // Initial message to the worker
            worker.postMessage({
                canvas: offscreenCanvas,
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio,
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark'
            }, [offscreenCanvas]);

            // Function to send theme updates to the 3D background worker
            const updateTheme = () => {
                const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
                worker.postMessage({ theme: theme });
            };

            const resizeHandler = () => {
                requestAnimationFrame(() => {
                    worker.postMessage({
                        resize: {
                            width: window.innerWidth,
                            height: window.innerHeight
                        }
                    });
                });
            };

            // This observer tells the 3D background to update when the theme class changes on the body.
            // The theme toggle button itself is already wired up in index.html (it owns the
            // light-mode class toggle, the icon/logo swap, and localStorage persistence) -
            // this observer is what keeps the 3D background in sync with that, so no separate
            // click listener is needed here.
            new MutationObserver(updateTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

            window.addEventListener('resize', resizeHandler, false);

        } catch (error) {
            console.error('Failed to initialize OffscreenCanvas worker:', error);
            if (canvas) canvas.style.display = 'none';
        }
    } else {
        if (canvas) canvas.style.display = 'none';
        console.warn('OffscreenCanvas or Web Workers not supported, hiding 3D background.');
    }
});
