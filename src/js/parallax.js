/**
 * Parallax effects for hero section
 * Handles both pointer-move and scroll-based parallax
 */

import { prefersReducedMotion } from './particles.js';

const POINTER_PARALLAX_FACTOR = 12; // Max px translation
const SCROLL_PARALLAX_FACTOR = 0.6; // Background scroll speed multiplier

let heroContent = null;
let heroGradient = null;
let isEnabled = false;

/**
 * Handle pointer move for parallax effect
 * @param {MouseEvent} event - Mouse move event
 */
function handlePointerMove(event) {
  if (!isEnabled || !heroContent || prefersReducedMotion()) return;

  const { clientX, clientY } = event;
  const { innerWidth, innerHeight } = window;

  // Calculate offset from center (-1 to 1)
  const offsetX = (clientX - innerWidth / 2) / (innerWidth / 2);
  const offsetY = (clientY - innerHeight / 2) / (innerHeight / 2);

  // Apply parallax translation
  const translateX = offsetX * POINTER_PARALLAX_FACTOR;
  const translateY = offsetY * POINTER_PARALLAX_FACTOR;

  heroContent.style.transform = `translate(${translateX}px, ${translateY}px)`;
}

/**
 * Handle scroll for background parallax
 */
function handleScroll() {
  if (!isEnabled || !heroGradient || prefersReducedMotion()) return;

  const scrollY = window.scrollY;
  const translateY = scrollY * SCROLL_PARALLAX_FACTOR;

  heroGradient.style.transform = `translateY(${translateY}px)`;
}

/**
 * Initialize parallax effects
 */
export function initParallax() {
  heroContent = document.getElementById('hero-content');
  heroGradient = document.getElementById('hero-gradient');

  if (!heroContent || !heroGradient) return;

  // Don't enable if reduced motion is preferred
  if (prefersReducedMotion()) {
    return;
  }

  isEnabled = true;

  // Add event listeners
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Listen for reduced motion preference changes
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionQuery.addEventListener('change', (e) => {
    if (e.matches) {
      disableParallax();
    } else {
      enableParallax();
    }
  });
}

/**
 * Disable parallax effects and reset transforms
 */
export function disableParallax() {
  isEnabled = false;

  if (heroContent) {
    heroContent.style.transform = '';
  }

  if (heroGradient) {
    heroGradient.style.transform = '';
  }
}

/**
 * Enable parallax effects
 */
export function enableParallax() {
  if (!prefersReducedMotion()) {
    isEnabled = true;
  }
}

/**
 * Clean up parallax event listeners
 */
export function destroyParallax() {
  window.removeEventListener('mousemove', handlePointerMove);
  window.removeEventListener('scroll', handleScroll);
  disableParallax();
  heroContent = null;
  heroGradient = null;
}
