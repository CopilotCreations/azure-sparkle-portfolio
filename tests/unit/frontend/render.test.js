/**
 * Tests for render functions
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import {
  formatDateRange,
  escapeHtml,
  renderProjects,
  renderSkills,
  renderExperience,
} from '../../../src/js/render.js';

// Set up DOM
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<body>
  <div id="projects-grid"></div>
  <div id="skills-grid"></div>
  <div id="experience-timeline"></div>
</body>
</html>
`);

global.document = dom.window.document;

describe('render utilities', () => {
  describe('formatDateRange', () => {
    it('should format start and end dates', () => {
      expect(formatDateRange('2020-01', '2022-12')).toBe('Jan 2020 — Dec 2022');
    });

    it('should handle "present" end date', () => {
      expect(formatDateRange('2022-03', 'present')).toBe('Mar 2022 — Present');
    });

    it('should format single month correctly', () => {
      expect(formatDateRange('2021-06', '2021-06')).toBe('Jun 2021 — Jun 2021');
    });

    it('should handle various months', () => {
      expect(formatDateRange('2020-02', '2020-11')).toBe('Feb 2020 — Nov 2020');
      expect(formatDateRange('2019-07', '2020-03')).toBe('Jul 2019 — Mar 2020');
    });

    it('should handle all 12 months', () => {
      expect(formatDateRange('2020-01', '2020-01')).toContain('Jan');
      expect(formatDateRange('2020-02', '2020-02')).toContain('Feb');
      expect(formatDateRange('2020-03', '2020-03')).toContain('Mar');
      expect(formatDateRange('2020-04', '2020-04')).toContain('Apr');
      expect(formatDateRange('2020-05', '2020-05')).toContain('May');
      expect(formatDateRange('2020-06', '2020-06')).toContain('Jun');
      expect(formatDateRange('2020-07', '2020-07')).toContain('Jul');
      expect(formatDateRange('2020-08', '2020-08')).toContain('Aug');
      expect(formatDateRange('2020-09', '2020-09')).toContain('Sep');
      expect(formatDateRange('2020-10', '2020-10')).toContain('Oct');
      expect(formatDateRange('2020-11', '2020-11')).toContain('Nov');
      expect(formatDateRange('2020-12', '2020-12')).toContain('Dec');
    });
  });

  describe('escapeHtml', () => {
    it('should escape ampersand', () => {
      expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
    });

    it('should escape less than', () => {
      expect(escapeHtml('foo < bar')).toBe('foo &lt; bar');
    });

    it('should escape greater than', () => {
      expect(escapeHtml('foo > bar')).toBe('foo &gt; bar');
    });

    it('should escape double quotes', () => {
      expect(escapeHtml('foo "bar"')).toBe('foo &quot;bar&quot;');
    });

    it('should escape single quotes', () => {
      expect(escapeHtml("foo 'bar'")).toBe('foo &#039;bar&#039;');
    });

    it('should escape multiple special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should return empty string for non-string input', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(123)).toBe('');
    });

    it('should return unchanged string if no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('test123')).toBe('test123');
    });

    it('should handle empty string', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle all HTML entities together', () => {
      expect(escapeHtml('<a href="test" & \'data\'>')).toBe(
        '&lt;a href=&quot;test&quot; &amp; &#039;data&#039;&gt;'
      );
    });
  });

  describe('renderProjects', () => {
    beforeEach(() => {
      document.getElementById('projects-grid').innerHTML = '';
    });

    it('should render projects into container', () => {
      const projects = [
        {
          id: 'test-1',
          title: 'Test Project',
          tagline: 'A test project',
          description: 'Description',
          tech: ['JavaScript', 'React'],
          githubUrl: 'https://github.com/test',
          liveUrl: null,
          images: [],
          metrics: [],
        },
      ];

      renderProjects(projects);
      const container = document.getElementById('projects-grid');
      expect(container.children.length).toBe(1);
    });

    it('should render multiple projects', () => {
      const projects = [
        {
          id: 'p1',
          title: 'P1',
          tagline: 'T1',
          description: 'D1',
          tech: ['JS'],
          githubUrl: null,
          liveUrl: null,
          images: [],
          metrics: [],
        },
        {
          id: 'p2',
          title: 'P2',
          tagline: 'T2',
          description: 'D2',
          tech: ['TS'],
          githubUrl: null,
          liveUrl: null,
          images: [],
          metrics: [],
        },
      ];

      renderProjects(projects);
      const container = document.getElementById('projects-grid');
      expect(container.children.length).toBe(2);
    });

    it('should handle null container gracefully', () => {
      const originalContainer = document.getElementById('projects-grid');
      originalContainer.id = 'temp';

      // Should not throw
      expect(() => renderProjects([{ id: 'test' }])).not.toThrow();

      originalContainer.id = 'projects-grid';
    });

    it('should handle null projects gracefully', () => {
      expect(() => renderProjects(null)).not.toThrow();
    });
  });

  describe('renderSkills', () => {
    beforeEach(() => {
      document.getElementById('skills-grid').innerHTML = '';
    });

    it('should render skill categories', () => {
      const categories = [
        {
          name: 'Languages',
          items: [
            { name: 'JavaScript', level: 'core' },
            { name: 'Python', level: 'strong' },
          ],
        },
      ];

      renderSkills(categories);
      const container = document.getElementById('skills-grid');
      expect(container.children.length).toBe(1);
    });

    it('should handle multiple categories', () => {
      const categories = [
        { name: 'Languages', items: [{ name: 'JS', level: 'core' }] },
        { name: 'Frameworks', items: [{ name: 'React', level: 'strong' }] },
      ];

      renderSkills(categories);
      const container = document.getElementById('skills-grid');
      expect(container.children.length).toBe(2);
    });

    it('should handle null container gracefully', () => {
      const originalContainer = document.getElementById('skills-grid');
      originalContainer.id = 'temp';

      expect(() => renderSkills([{ name: 'Test', items: [] }])).not.toThrow();

      originalContainer.id = 'skills-grid';
    });

    it('should handle null categories gracefully', () => {
      expect(() => renderSkills(null)).not.toThrow();
    });
  });

  describe('renderExperience', () => {
    beforeEach(() => {
      document.getElementById('experience-timeline').innerHTML = '';
    });

    it('should render experience items', () => {
      const experiences = [
        {
          company: 'Test Corp',
          role: 'Developer',
          start: '2022-01',
          end: 'present',
          bullets: ['Did something', 'Did another thing'],
        },
      ];

      renderExperience(experiences);
      const container = document.getElementById('experience-timeline');
      expect(container.children.length).toBe(1);
    });

    it('should sort by start date descending', () => {
      const experiences = [
        {
          company: 'Old Corp',
          role: 'Jr Dev',
          start: '2018-01',
          end: '2020-01',
          bullets: ['Work'],
        },
        {
          company: 'New Corp',
          role: 'Sr Dev',
          start: '2022-01',
          end: 'present',
          bullets: ['Work'],
        },
      ];

      renderExperience(experiences);
      const container = document.getElementById('experience-timeline');
      const firstItem = container.children[0];
      expect(firstItem.textContent).toContain('New Corp');
    });

    it('should handle null container gracefully', () => {
      const originalContainer = document.getElementById('experience-timeline');
      originalContainer.id = 'temp';

      expect(() => renderExperience([{ company: 'Test' }])).not.toThrow();

      originalContainer.id = 'experience-timeline';
    });

    it('should handle null experiences gracefully', () => {
      expect(() => renderExperience(null)).not.toThrow();
    });
  });
});
