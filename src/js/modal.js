/**
 * Modal component for project details
 * Manages modal state, focus trapping, and accessibility
 */

// Modal states
const STATE = {
  CLOSED: 'closed',
  OPENING: 'opening',
  OPEN: 'open',
  CLOSING: 'closing',
};

let state = STATE.CLOSED;
let modalEl = null;
let overlayEl = null;
let closeBtn = null;
let panelEl = null;
let triggerEl = null;
let focusableElements = [];
let onOpenCallback = null;

/**
 * Get all focusable elements within the modal
 * @returns {HTMLElement[]} Array of focusable elements
 */
function getFocusableElements() {
  if (!panelEl) return [];

  const selector = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(', ');

  return Array.from(panelEl.querySelectorAll(selector));
}

/**
 * Handle keyboard events within modal
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeydown(event) {
  if (state !== STATE.OPEN) return;

  // ESC closes modal
  if (event.key === 'Escape') {
    event.preventDefault();
    closeModal();
    return;
  }

  // Tab trapping
  if (event.key === 'Tab') {
    focusableElements = getFocusableElements();

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
      if (document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    }
  }
}

/**
 * Handle overlay click
 * @param {MouseEvent} event - Click event
 */
function handleOverlayClick(event) {
  if (event.target === overlayEl) {
    closeModal();
  }
}

/**
 * Open the modal
 * @param {HTMLElement} trigger - Element that triggered the open
 * @param {Object} projectData - Project data to display
 */
export function openModal(trigger, projectData) {
  if (state !== STATE.CLOSED) return;

  state = STATE.OPENING;
  triggerEl = trigger;

  // Show modal
  modalEl.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Populate modal content if callback is set
  if (onOpenCallback && projectData) {
    onOpenCallback(projectData);
  }

  state = STATE.OPEN;

  // Focus close button
  setTimeout(() => {
    focusableElements = getFocusableElements();
    if (closeBtn) {
      closeBtn.focus();
    }
  }, 50);
}

/**
 * Close the modal
 */
export function closeModal() {
  if (state !== STATE.OPEN) return;

  state = STATE.CLOSING;

  // Hide modal
  modalEl.classList.add('hidden');
  document.body.style.overflow = '';

  state = STATE.CLOSED;

  // Return focus to trigger
  if (triggerEl) {
    triggerEl.focus();
    triggerEl = null;
  }
}

/**
 * Set callback for when modal opens with project data
 * @param {Function} callback - Callback function
 */
export function setOnOpenCallback(callback) {
  onOpenCallback = callback;
}

/**
 * Initialize modal component
 */
export function initModal() {
  modalEl = document.getElementById('project-modal');
  overlayEl = document.getElementById('modal-overlay');
  closeBtn = document.getElementById('modal-close');
  panelEl = document.getElementById('modal-panel');

  if (!modalEl || !overlayEl || !closeBtn || !panelEl) return;

  // Event listeners
  closeBtn.addEventListener('click', closeModal);
  overlayEl.addEventListener('click', handleOverlayClick);
  document.addEventListener('keydown', handleKeydown);

  // Handle project card clicks
  document.addEventListener('click', (event) => {
    const card = event.target.closest('.project-card');
    if (card && card._projectData) {
      openModal(card, card._projectData);
    }
  });

  // Handle keyboard activation on project cards
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      const card = event.target.closest('.project-card');
      if (card && card._projectData) {
        event.preventDefault();
        openModal(card, card._projectData);
      }
    }
  });
}

/**
 * Get current modal state
 * @returns {string} Current state
 */
export function getModalState() {
  return state;
}

/**
 * Clean up modal resources
 */
export function destroyModal() {
  if (closeBtn) {
    closeBtn.removeEventListener('click', closeModal);
  }
  if (overlayEl) {
    overlayEl.removeEventListener('click', handleOverlayClick);
  }
  document.removeEventListener('keydown', handleKeydown);

  state = STATE.CLOSED;
  modalEl = null;
  overlayEl = null;
  closeBtn = null;
  panelEl = null;
  triggerEl = null;
  focusableElements = [];
  onOpenCallback = null;
}

// Export state constants for testing
export { STATE };
