// src/three-optimized.js
// Optimized Three.js imports for Prysmi Media Labs waving dots background

import { 
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  Color
} from 'three';

// Initialize Three.js Background Animation
function initializeThreeJSBackground() {
  const canvas = document.getElementById('waving-dots-3d-background');
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
    
    // Theme color update function
    window.updateThreeJSColors = function() {
      const isLightMode = document.body.classList.contains('light-mode');
      renderer.setClearColor(isLightMode ? 0xF5F5F5 : 0x0A0A0A, 1);
      
      if (particleSystem) {
        const colorsArray = particleSystem.geometry.attributes.color.array;
        const palette = isLightMode 
          ? [new Color("#FF53AC"), new Color("#333333")] 
          : [new Color("#FF53AC"), new Color("#FFFFFF")];
        
        for (let i = 0; i < colorsArray.length; i += 3) {
          const color = palette[Math.floor(Math.random() * palette.length)];
          colorsArray[i] = color.r;
          colorsArray[i + 1] = color.g;
          colorsArray[i + 2] = color.b;
        }
        particleSystem.geometry.attributes.color.needsUpdate = true;
      }
    };
    
    // Create particle system
    const dotCount = window.innerWidth < 768 ? 4000 : 12000;
    const particlesGeometry = new BufferGeometry();
    const positions = new Float32Array(dotCount * 3);
    const colorsAttribute = new Float32Array(dotCount * 3);
    
    // Initialize positions
    for (let i = 0; i < dotCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 40;
    }
    
    particlesGeometry.setAttribute('position', new BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new BufferAttribute(colorsAttribute, 3));
    
    const particleMaterial = new PointsMaterial({ 
      size: 0.08, 
      vertexColors: true, 
      transparent: true, 
      opacity: 0.8 
    });
    
    particleSystem = new Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Camera positioning
    camera.position.set(0, 5, 15);
    camera.lookAt(scene.position);
    
    // Animation loop
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
    
    // Handle window resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);
    
    // Initialize colors and start animation
    window.updateThreeJSColors();
    animate();
    
  } catch (error) {
    console.error("Three.js initialization failed:", error);
    canvas.style.display = 'none';
  }
}

// Export the initialization function
export { initializeThreeJSBackground };

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('load', () => {
      setTimeout(initializeThreeJSBackground, 100);
    });
  });
} else {
  window.addEventListener('load', () => {
    setTimeout(initializeThreeJSBackground, 100);
  });
}
