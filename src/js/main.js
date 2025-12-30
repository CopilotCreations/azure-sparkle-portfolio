/**
 * Main application entry point
 * Bootstraps all site functionality
 */

import { initParticles, prefersReducedMotion } from './particles.js';
import { initParallax } from './parallax.js';
import { initScrollspy } from './scrollspy.js';
import { initModal } from './modal.js';
import { initCarousel } from './carousel.js';
import { renderProjects, renderSkills, renderExperience } from './render.js';
import { initForm } from './form.js';

// Data imports
import projectsData from '../data/projects.json';
import skillsData from '../data/skills.json';
import experienceData from '../data/experience.json';

/**
 * Initialize the application when DOM is ready
 */
function init() {
  // Set current year in footer
  const yearEl = document.getElementById('current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }

  // Initialize particle system
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    initParticles(canvas);
  }

  // Initialize parallax effects (respects reduced motion)
  if (!prefersReducedMotion()) {
    initParallax();
  }

  // Initialize scroll spy for navigation
  initScrollspy();

  // Render dynamic content
  renderProjects(projectsData);
  renderSkills(skillsData);
  renderExperience(experienceData);

  // Initialize modal and carousel
  initModal();
  initCarousel();

  // Initialize contact form
  initForm();

  // Handle mobile menu
  initMobileMenu();

  // Handle hash navigation on load
  handleInitialHash();
}

/**
 * Initialize mobile menu toggle
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (!menuBtn || !mobileMenu) return;

  menuBtn.addEventListener('click', () => {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', (!isExpanded).toString());
    mobileMenu.classList.toggle('hidden');
  });

  // Close menu when clicking a link
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.add('hidden');
    });
  });
}

/**
 * Handle initial hash in URL for direct section navigation
 */
function handleInitialHash() {
  if (window.location.hash) {
    const targetId = window.location.hash.substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
