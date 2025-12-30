/**
 * Image carousel for project modal
 * Handles image navigation and display
 */

import { setOnOpenCallback, getModalState, STATE } from './modal.js';
import { escapeHtml } from './render.js';

let images = [];
let currentIndex = 0;
let carouselImage = null;
let carouselPlaceholder = null;
let prevBtn = null;
let nextBtn = null;
let dotsContainer = null;

/**
 * Update carousel display
 */
function updateCarousel() {
  if (images.length === 0) {
    // Show placeholder
    if (carouselImage) carouselImage.classList.add('hidden');
    if (carouselPlaceholder) carouselPlaceholder.classList.remove('hidden');
    if (prevBtn) prevBtn.classList.add('hidden');
    if (nextBtn) nextBtn.classList.add('hidden');
    if (dotsContainer) dotsContainer.innerHTML = '';
    return;
  }

  // Show image
  if (carouselImage) {
    carouselImage.classList.remove('hidden');
    carouselImage.src = images[currentIndex];
    carouselImage.alt = `Project image ${currentIndex + 1} of ${images.length}`;
  }
  if (carouselPlaceholder) carouselPlaceholder.classList.add('hidden');

  // Show/hide navigation buttons
  const showControls = images.length >= 2;
  if (prevBtn) prevBtn.classList.toggle('hidden', !showControls);
  if (nextBtn) nextBtn.classList.toggle('hidden', !showControls);

  // Update dots
  updateDots();
}

/**
 * Update carousel dot indicators
 */
function updateDots() {
  if (!dotsContainer) return;

  if (images.length < 2) {
    dotsContainer.innerHTML = '';
    return;
  }

  dotsContainer.innerHTML = images
    .map(
      (_, idx) => `
    <button
      class="w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/60'}"
      aria-label="Go to image ${idx + 1}"
      data-index="${idx}"
    ></button>
  `
    )
    .join('');
}

/**
 * Navigate to next image
 */
export function nextImage() {
  if (images.length < 2) return;

  currentIndex = (currentIndex + 1) % images.length;
  updateCarousel();
}

/**
 * Navigate to previous image
 */
export function prevImage() {
  if (images.length < 2) return;

  currentIndex = (currentIndex - 1 + images.length) % images.length;
  updateCarousel();
}

/**
 * Navigate to specific image
 * @param {number} index - Image index
 */
export function goToImage(index) {
  if (index < 0 || index >= images.length) return;

  currentIndex = index;
  updateCarousel();
}

/**
 * Handle keyboard navigation
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeydown(event) {
  if (getModalState() !== STATE.OPEN) return;

  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    prevImage();
  } else if (event.key === 'ArrowRight') {
    event.preventDefault();
    nextImage();
  }
}

/**
 * Populate modal content with project data
 * @param {Object} project - Project data
 */
function populateModal(project) {
  // Set carousel images
  images = project.images || [];
  currentIndex = 0;
  updateCarousel();

  // Set title and tagline
  const titleEl = document.getElementById('modal-title');
  const taglineEl = document.getElementById('modal-tagline');
  const descriptionEl = document.getElementById('modal-description');

  if (titleEl) titleEl.textContent = project.title;
  if (taglineEl) taglineEl.textContent = project.tagline;
  if (descriptionEl) descriptionEl.textContent = project.description;

  // Set tech tags
  const techContainer = document.getElementById('modal-tech');
  if (techContainer) {
    techContainer.innerHTML = (project.tech || [])
      .map(
        (tech) =>
          `<span class="inline-block px-3 py-1 text-sm rounded-full bg-primary-500/20 text-primary-300">${escapeHtml(tech)}</span>`
      )
      .join('');
  }

  // Set metrics
  const metricsSection = document.getElementById('modal-metrics');
  const metricsList = document.getElementById('modal-metrics-list');

  if (metricsSection && metricsList) {
    if (project.metrics && project.metrics.length > 0) {
      metricsSection.classList.remove('hidden');
      metricsList.innerHTML = project.metrics
        .map(
          (metric) =>
            `<li class="flex items-start gap-2">
          <svg class="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="text-gray-300">${escapeHtml(metric)}</span>
        </li>`
        )
        .join('');
    } else {
      metricsSection.classList.add('hidden');
    }
  }

  // Set action buttons
  const actionsContainer = document.getElementById('modal-actions');
  if (actionsContainer) {
    const buttons = [];

    if (project.githubUrl) {
      buttons.push(`
        <a
          href="${escapeHtml(project.githubUrl)}"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd"/>
          </svg>
          GitHub
        </a>
      `);
    }

    if (project.liveUrl) {
      buttons.push(`
        <a
          href="${escapeHtml(project.liveUrl)}"
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          Live Demo
        </a>
      `);
    }

    actionsContainer.innerHTML = buttons.join('');
  }
}

/**
 * Initialize carousel component
 */
export function initCarousel() {
  carouselImage = document.getElementById('carousel-image');
  carouselPlaceholder = document.getElementById('carousel-placeholder');
  prevBtn = document.getElementById('carousel-prev');
  nextBtn = document.getElementById('carousel-next');
  dotsContainer = document.getElementById('carousel-dots');

  // Button event listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevImage();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextImage();
    });
  }

  // Dot navigation
  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      const button = e.target.closest('button');
      if (button && button.dataset.index !== undefined) {
        goToImage(parseInt(button.dataset.index, 10));
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', handleKeydown);

  // Set up modal open callback
  setOnOpenCallback(populateModal);
}

/**
 * Get current carousel state for testing
 * @returns {Object} Current state
 */
export function getCarouselState() {
  return {
    images,
    currentIndex,
  };
}

/**
 * Clean up carousel resources
 */
export function destroyCarousel() {
  if (prevBtn) prevBtn.removeEventListener('click', prevImage);
  if (nextBtn) nextBtn.removeEventListener('click', nextImage);
  document.removeEventListener('keydown', handleKeydown);

  images = [];
  currentIndex = 0;
  carouselImage = null;
  carouselPlaceholder = null;
  prevBtn = null;
  nextBtn = null;
  dotsContainer = null;
}
