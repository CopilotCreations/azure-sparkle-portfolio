/**
 * Scroll spy for navigation highlighting
 * Uses IntersectionObserver to track visible sections
 */

// Section must be 60% visible to be considered active
const ACTIVE_THRESHOLD = 0.6;
const SECTIONS = ['home', 'about', 'projects', 'skills', 'experience', 'contact'];

let observer = null;
let activeSection = null;

/**
 * Update navigation link active states
 * @param {string} sectionId - ID of the active section
 */
function updateActiveNav(sectionId) {
  if (activeSection === sectionId) return;

  activeSection = sectionId;

  // Update all nav links
  document.querySelectorAll('.nav-link').forEach((link) => {
    const linkSection = link.getAttribute('data-section');

    if (linkSection === sectionId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update URL hash without scrolling
  if (sectionId && sectionId !== 'home') {
    history.replaceState(null, '', `#${sectionId}`);
  } else if (sectionId === 'home') {
    history.replaceState(null, '', window.location.pathname);
  }
}

/**
 * Handle intersection changes
 * @param {IntersectionObserverEntry[]} entries - Observer entries
 */
function handleIntersection(entries) {
  // Find the most visible section
  let mostVisible = null;
  let highestRatio = 0;

  for (const entry of entries) {
    if (entry.isIntersecting && entry.intersectionRatio > highestRatio) {
      highestRatio = entry.intersectionRatio;
      mostVisible = entry.target.id;
    }
  }

  // If we found a visible section, update it
  if (mostVisible) {
    updateActiveNav(mostVisible);
  }
}

/**
 * Initialize scroll spy
 */
export function initScrollspy() {
  // Get all sections
  const sections = SECTIONS.map((id) => document.getElementById(id)).filter(Boolean);

  if (sections.length === 0) return;

  // Create observer
  observer = new IntersectionObserver(handleIntersection, {
    root: null,
    rootMargin: '-20% 0px -20% 0px',
    threshold: [0, 0.25, 0.5, ACTIVE_THRESHOLD, 0.75, 1],
  });

  // Observe each section
  sections.forEach((section) => {
    observer.observe(section);
  });

  // Handle nav link clicks for smooth scrolling
  document.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', handleNavClick);
  });

  // Set initial active section
  const hash = window.location.hash.substring(1);
  if (hash && SECTIONS.includes(hash)) {
    updateActiveNav(hash);
  } else {
    updateActiveNav('home');
  }
}

/**
 * Handle navigation link click
 * @param {Event} event - Click event
 */
function handleNavClick(event) {
  const href = event.currentTarget.getAttribute('href');

  if (href && href.startsWith('#')) {
    event.preventDefault();

    const targetId = href.substring(1);
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * Clean up scroll spy
 */
export function destroyScrollspy() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  document.querySelectorAll('.nav-link').forEach((link) => {
    link.removeEventListener('click', handleNavClick);
  });

  activeSection = null;
}

/**
 * Get current active section
 * @returns {string|null} Active section ID
 */
export function getActiveSection() {
  return activeSection;
}
