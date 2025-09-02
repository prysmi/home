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

            // Function to send theme updates to the 3D background worker.
            // This will be triggered by the MutationObserver below.
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

            // Event listeners
            // This observer correctly listens for class changes on the <body> (triggered by index.html)
            // and tells the 3D background to update its colors.
            new MutationObserver(updateTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });

            // ERROR FIXED: The conflicting click listener has been removed from this file.
            // The script in index.html is now the single source of truth for handling the click.

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

