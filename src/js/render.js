/**
 * Render functions for dynamic content
 * Pure functions that accept JSON data and render DOM elements
 */

/**
 * Render projects grid from JSON data
 * @param {Array} projects - Projects data array
 */
export function renderProjects(projects) {
  const container = document.getElementById('projects-grid');
  if (!container || !projects) return;

  container.innerHTML = '';

  projects.forEach((project) => {
    const card = createProjectCard(project);
    container.appendChild(card);
  });
}

/**
 * Create a project card element
 * @param {Object} project - Project data
 * @returns {HTMLElement} Project card element
 */
function createProjectCard(project) {
  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `View details for ${project.title}`);
  card.dataset.projectId = project.id;

  // Tech tags (show max 4, then +N)
  const visibleTech = project.tech.slice(0, 4);
  const hiddenCount = project.tech.length - 4;

  const techTags = visibleTech
    .map(
      (tech) =>
        `<span class="inline-block px-2 py-0.5 text-xs rounded bg-primary-500/20 text-primary-300">${escapeHtml(tech)}</span>`
    )
    .join('');

  const moreTags =
    hiddenCount > 0
      ? `<span class="inline-block px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-400">+${hiddenCount}</span>`
      : '';

  card.innerHTML = `
    <div class="p-6">
      <h3 class="text-xl font-semibold text-white mb-2">${escapeHtml(project.title)}</h3>
      <p class="text-gray-400 text-sm mb-4">${escapeHtml(project.tagline)}</p>
      <div class="flex flex-wrap gap-2">
        ${techTags}
        ${moreTags}
      </div>
    </div>
  `;

  // Store full project data for modal
  card._projectData = project;

  return card;
}

/**
 * Render skills grid from JSON data
 * @param {Array} categories - Skills categories array
 */
export function renderSkills(categories) {
  const container = document.getElementById('skills-grid');
  if (!container || !categories) return;

  container.innerHTML = '';

  categories.forEach((category) => {
    const categoryEl = createSkillCategory(category);
    container.appendChild(categoryEl);
  });
}

/**
 * Create a skill category element
 * @param {Object} category - Category data
 * @returns {HTMLElement} Category element
 */
function createSkillCategory(category) {
  const div = document.createElement('div');
  div.className = 'space-y-4';

  const skills = category.items
    .map((skill) => {
      const levelClass = `skill-level-${skill.level}`;
      const levelLabel = skill.level.charAt(0).toUpperCase() + skill.level.slice(1);

      return `
      <div class="skill-chip">
        <span class="text-gray-200">${escapeHtml(skill.name)}</span>
        <span class="text-xs px-1.5 py-0.5 rounded ${levelClass}">${levelLabel}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = `
    <h3 class="text-lg font-semibold text-white">${escapeHtml(category.name)}</h3>
    <div class="flex flex-wrap gap-2">
      ${skills}
    </div>
  `;

  return div;
}

/**
 * Render experience timeline from JSON data
 * @param {Array} experiences - Experience items array
 */
export function renderExperience(experiences) {
  const container = document.getElementById('experience-timeline');
  if (!container || !experiences) return;

  container.innerHTML = '';

  // Sort by start date descending (most recent first)
  const sorted = [...experiences].sort((a, b) => {
    return b.start.localeCompare(a.start);
  });

  sorted.forEach((experience) => {
    const item = createExperienceItem(experience);
    container.appendChild(item);
  });
}

/**
 * Create an experience timeline item
 * @param {Object} experience - Experience data
 * @returns {HTMLElement} Timeline item element
 */
function createExperienceItem(experience) {
  const div = document.createElement('div');
  div.className = 'timeline-item';

  const dateRange = formatDateRange(experience.start, experience.end);

  const bullets = experience.bullets
    .map((bullet) => `<li class="text-gray-400">${escapeHtml(bullet)}</li>`)
    .join('');

  div.innerHTML = `
    <div class="mb-1 text-sm text-primary-400">${dateRange}</div>
    <h3 class="text-xl font-semibold text-white">${escapeHtml(experience.role)}</h3>
    <p class="text-gray-300 mb-3">${escapeHtml(experience.company)}</p>
    <ul class="list-disc list-inside space-y-1 text-sm">
      ${bullets}
    </ul>
  `;

  return div;
}

/**
 * Format date range string
 * @param {string} start - Start date in YYYY-MM format
 * @param {string} end - End date in YYYY-MM format or "present"
 * @returns {string} Formatted date range
 */
export function formatDateRange(start, end) {
  const formatDate = (dateStr) => {
    if (dateStr === 'present') return 'Present';

    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return `${formatDate(start)} — ${formatDate(end)}`;
}

/**
 * Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return str.replace(/[&<>"']/g, (char) => map[char]);
}
