/**
 * Particle system for hero background
 * Creates animated particles with connection lines
 */

let animationFrameId = null;
let particles = [];
let canvas = null;
let ctx = null;
let isAnimating = false;

// Particle configuration
const CONFIG = {
  particleCounts: {
    large: 120, // viewport >= 1024px
    medium: 80, // viewport 768-1023px
    small: 50, // viewport < 768px
  },
  minRadius: 1,
  maxRadius: 3,
  minSpeed: 0.15,
  maxSpeed: 0.45,
  connectionDistance: 120,
  maxOpacity: 0.35,
  particleColor: 'rgba(14, 165, 233, 0.6)', // primary-500
};

/**
 * Check if user prefers reduced motion
 * @returns {boolean}
 */
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get particle count based on viewport width
 * @returns {number}
 */
function getParticleCount() {
  const width = window.innerWidth;
  if (width >= 1024) return CONFIG.particleCounts.large;
  if (width >= 768) return CONFIG.particleCounts.medium;
  return CONFIG.particleCounts.small;
}

/**
 * Create a single particle
 * @returns {Object} Particle object
 */
function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const speed = CONFIG.minSpeed + Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);

  return {
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius),
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

/**
 * Initialize particles array
 */
function initParticlesArray() {
  const count = getParticleCount();
  particles = [];
  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }
}

/**
 * Update particle position
 * @param {Object} particle - Particle to update
 */
function updateParticle(particle) {
  particle.x += particle.vx;
  particle.y += particle.vy;

  // Wrap around edges
  if (particle.x < 0) particle.x = canvas.width;
  if (particle.x > canvas.width) particle.x = 0;
  if (particle.y < 0) particle.y = canvas.height;
  if (particle.y > canvas.height) particle.y = 0;
}

/**
 * Draw a single particle
 * @param {Object} particle - Particle to draw
 */
function drawParticle(particle) {
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
  ctx.fillStyle = CONFIG.particleColor;
  ctx.fill();
}

/**
 * Draw connection line between two particles
 * @param {Object} p1 - First particle
 * @param {Object} p2 - Second particle
 * @param {number} distance - Distance between particles
 */
function drawConnection(p1, p2, distance) {
  const opacity = (1 - distance / CONFIG.connectionDistance) * CONFIG.maxOpacity;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/**
 * Main animation loop
 */
function animate() {
  if (!isAnimating) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update and draw particles
  for (const particle of particles) {
    updateParticle(particle);
    drawParticle(particle);
  }

  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONFIG.connectionDistance) {
        drawConnection(particles[i], particles[j], distance);
      }
    }
  }

  animationFrameId = requestAnimationFrame(animate);
}

/**
 * Handle canvas resize
 */
function handleResize() {
  if (!canvas) return;

  const hero = canvas.parentElement;
  if (!hero) return;

  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;

  // Reinitialize particles on significant size change
  initParticlesArray();

  // If reduced motion, draw static frame
  if (prefersReducedMotion() && !isAnimating) {
    drawStaticFrame();
  }
}

/**
 * Draw a single static frame (for reduced motion)
 */
function drawStaticFrame() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const particle of particles) {
    drawParticle(particle);
  }

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < CONFIG.connectionDistance) {
        drawConnection(particles[i], particles[j], distance);
      }
    }
  }
}

/**
 * Initialize the particle system
 * @param {HTMLCanvasElement} canvasElement - Canvas element to use
 */
export function initParticles(canvasElement) {
  if (!canvasElement) return;

  canvas = canvasElement;
  ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Set initial size
  handleResize();

  // Initialize particles
  initParticlesArray();

  // Handle reduced motion preference
  if (prefersReducedMotion()) {
    drawStaticFrame();
    return;
  }

  // Start animation
  isAnimating = true;
  animate();

  // Handle resize
  window.addEventListener('resize', handleResize);

  // Listen for reduced motion preference changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', (e) => {
    if (e.matches) {
      stopAnimation();
      drawStaticFrame();
    } else {
      startAnimation();
    }
  });
}

/**
 * Stop the animation
 */
export function stopAnimation() {
  isAnimating = false;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

/**
 * Start/resume the animation
 */
export function startAnimation() {
  if (!isAnimating && !prefersReducedMotion()) {
    isAnimating = true;
    animate();
  }
}

/**
 * Clean up resources
 */
export function destroyParticles() {
  stopAnimation();
  window.removeEventListener('resize', handleResize);
  particles = [];
  canvas = null;
  ctx = null;
}
