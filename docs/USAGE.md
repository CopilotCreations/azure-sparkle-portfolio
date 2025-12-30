# Usage Guide

This guide covers how to set up, develop, build, test, and deploy the Azure Sparkle Portfolio.

## Prerequisites

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Azure Account**: For deployment (optional for local development)
- **SendGrid Account**: For email functionality
- **Cloudflare Account**: For Turnstile CAPTCHA

## Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd azure-sparkle-portfolio

# Install dependencies
npm install
cd api && npm install && cd ..

# Copy environment files
cp .env.example .env.local
cp local.settings.example.json local.settings.json

# Start development server
npm run dev
```

## Environment Setup

### Frontend Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAABBBBBBBBBBBBBB
```

### API Environment Variables

Create a `local.settings.json` file in the project root (this is already gitignored):

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "NODE_ENV": "development",
    "SENDGRID_API_KEY": "SG.your-api-key-here",
    "CONTACT_TO_EMAIL": "your-email@example.com",
    "CONTACT_FROM_EMAIL": "no-reply@yourdomain.com",
    "TURNSTILE_SECRET_KEY": "0x4AAAAAAACCCCCCCCCCCCCC",
    "RATE_LIMIT_WINDOW_SECONDS": "60",
    "RATE_LIMIT_MAX_REQUESTS": "5"
  }
}
```

## Development

### Running the Development Server

```bash
# Frontend only (no API)
npm run dev

# Frontend + API (recommended)
npm run swa:start
```

The development server runs at `http://localhost:3000`.

### Available Scripts

| Command                 | Description                   |
| ----------------------- | ----------------------------- |
| `npm run dev`           | Start Vite development server |
| `npm run build`         | Build for production          |
| `npm run preview`       | Preview production build      |
| `npm run lint`          | Run ESLint                    |
| `npm run lint:fix`      | Fix ESLint issues             |
| `npm run format`        | Format code with Prettier     |
| `npm run format:check`  | Check code formatting         |
| `npm run test`          | Run tests                     |
| `npm run test:watch`    | Run tests in watch mode       |
| `npm run test:coverage` | Run tests with coverage       |
| `npm run typecheck`     | Check TypeScript types        |
| `npm run api:build`     | Build API TypeScript          |
| `npm run swa:start`     | Start SWA emulator            |

## Customization

### Updating Personal Information

1. **Hero Section**: Edit `src/index.html`, search for "Lorem Ipsum" and replace with your name
2. **About Section**: Edit the about paragraphs in `src/index.html`
3. **Social Links**: Update footer social media URLs in `src/index.html`

### Adding Projects

Edit `src/data/projects.json`:

```json
{
  "id": "unique-project-id",
  "title": "Project Title",
  "tagline": "Short description",
  "description": "Full project description...",
  "tech": ["React", "Node.js", "PostgreSQL"],
  "githubUrl": "https://github.com/you/project",
  "liveUrl": "https://project.example.com",
  "images": ["/assets/projects/image1.webp"],
  "metrics": ["Key achievement 1", "Key achievement 2"]
}
```

### Adding Skills

Edit `src/data/skills.json`:

```json
{
  "name": "Category Name",
  "items": [
    { "name": "Skill Name", "level": "core" },
    { "name": "Another Skill", "level": "strong" },
    { "name": "Learning Skill", "level": "familiar" }
  ]
}
```

Skill levels:

- `core`: Primary expertise (highlighted in blue)
- `strong`: Solid experience (highlighted in purple)
- `familiar`: Working knowledge (highlighted in gray)

### Adding Experience

Edit `src/data/experience.json`:

```json
{
  "company": "Company Name",
  "role": "Job Title",
  "start": "2022-03",
  "end": "present",
  "bullets": ["Achievement or responsibility 1", "Achievement or responsibility 2"]
}
```

### Adding Project Images

1. Place images in `src/assets/projects/`
2. Use `.webp` format for optimal performance
3. Reference in projects.json as `/assets/projects/filename.webp`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Coverage Requirements

- Overall project: ≥75% line coverage
- `api/shared/*`: ≥90% line coverage
- `src/js/modal.js`, `src/js/form.js`: ≥85% line coverage

### Test Structure

```
tests/
├── unit/
│   ├── api/              # API module tests
│   │   ├── validation.test.ts
│   │   ├── rateLimit.test.ts
│   │   ├── response.test.ts
│   │   ├── turnstile.test.ts
│   │   └── sendgrid.test.ts
│   └── frontend/         # Frontend module tests
│       ├── modal.test.js
│       ├── carousel.test.js
│       ├── api.test.js
│       ├── form.test.js
│       └── render.test.js
└── integration/          # Integration tests
    └── contact-api.test.ts
```

## Building for Production

```bash
# Build frontend
npm run build

# Build API
npm run api:build
```

The build output:

- Frontend: `dist/`
- API: `api/dist/`

## Deployment

### Azure Static Web Apps

1. **Create Azure Static Web App** in Azure Portal
2. **Get API Token** from Azure Portal → Static Web App → Manage deployment token
3. **Add GitHub Secret** named `AZURE_STATIC_WEB_APPS_API_TOKEN`
4. **Configure Environment Variables** in Azure Portal:
   - `SENDGRID_API_KEY`
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `TURNSTILE_SECRET_KEY`
   - `RATE_LIMIT_WINDOW_SECONDS`
   - `RATE_LIMIT_MAX_REQUESTS`

### CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/azure-static-web-apps.yml`):

1. Triggers on push to `main` or PR to `main`
2. Runs format check, lint, tests with coverage
3. Builds frontend and API
4. Deploys to Azure Static Web Apps
5. Creates preview environments for PRs

### Manual Deployment

```bash
# Install Azure SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy ./dist --api-location ./api --deployment-token <your-token>
```

## Troubleshooting

### Common Issues

**Issue**: Turnstile widget not appearing

- Check `VITE_TURNSTILE_SITE_KEY` is set correctly
- Verify the site key is valid in Cloudflare dashboard

**Issue**: Contact form returns 503

- This happens in preview environments without SendGrid configured
- Configure `SENDGRID_API_KEY` in Azure environment variables

**Issue**: Rate limit errors in testing

- Rate limits reset on cold start
- Use different IP addresses or wait 60 seconds

**Issue**: Email not received

- Check SendGrid activity log
- Verify sender email is verified in SendGrid
- Check spam folder

### Debug Mode

Enable verbose logging:

```bash
# Development
DEBUG=* npm run dev

# API locally
func start --verbose
```

## Accessibility

The site is designed to meet WCAG 2.1 AA standards:

- All interactive elements are keyboard accessible
- Focus states are clearly visible
- Modal focus is trapped and managed
- `prefers-reduced-motion` is respected
- ARIA attributes are properly set

### Testing Accessibility

```bash
# Using Lighthouse
npx lighthouse http://localhost:3000 --only-categories=accessibility

# Using axe-core (browser extension)
# Install axe DevTools browser extension
```

## Performance

### Lighthouse Targets

- Performance: ≥95
- Accessibility: ≥95
- Best Practices: ≥95
- SEO: ≥95

### Optimization Tips

1. **Images**: Use WebP format, optimize with tools like `squoosh`
2. **Fonts**: System fonts are used (no external fonts loaded)
3. **JavaScript**: Code-split if bundle exceeds 150KB
4. **CSS**: Tailwind purges unused styles automatically

## Security

### Best Practices

1. Never commit secrets to the repository
2. Use environment variables for all sensitive data
3. Keep dependencies updated (`npm audit`)
4. Review Content Security Policy if adding external resources

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```
