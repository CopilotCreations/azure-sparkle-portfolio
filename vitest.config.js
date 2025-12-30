import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.{test,spec}.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/js/**/*.js', 'api/shared/**/*.ts'],
      exclude: [
        'node_modules',
        'dist',
        'tests',
        // Browser-dependent modules that require full DOM/browser environment
        'src/js/main.js',
        'src/js/particles.js',
        'src/js/parallax.js',
        'src/js/scrollspy.js',
        'src/js/modal.js',
        'src/js/carousel.js',
        'src/js/form.js', // Form UI requires browser APIs; validation logic tested separately
        // External service modules
        'api/shared/sendgrid.ts', // SendGrid requires complex mock setup
      ],
      thresholds: {
        global: {
          lines: 75,
          functions: 70,
          branches: 70,
          statements: 75,
        },
      },
    },
  },
});
