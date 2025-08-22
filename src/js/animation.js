// src/js/animation.js
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('waving-dots-3d-background');
    if (canvas && 'transferControlToOffscreen' in canvas && typeof Worker !== 'undefined') {
        try {
            const offscreenCanvas = canvas.transferControlToOffscreen();
            const worker = new Worker('animation.worker.bundle.js', { type: 'module' });

            worker.postMessage({
                canvas: offscreenCanvas,
                width: window.innerWidth,
                height: window.innerHeight,
                pixelRatio: window.devicePixelRatio,
                theme: document.body.classList.contains('light-mode') ? 'light' : 'dark'
            }, [offscreenCanvas]);

            const updateTheme = () => {
                const theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
                worker.postMessage({ theme: theme });
            };

            const resizeHandler = () => {
                worker.postMessage({
                    resize: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    } // <-- This closing brace was missing
                });
            };

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
