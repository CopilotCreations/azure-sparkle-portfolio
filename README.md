# Azure Sparkle Portfolio

A flashy, single-page personal developer portfolio website deployed on Azure Static Web Apps. Features animated hero visuals, project showcase with modals, and a contact form powered by Azure Functions.

## ✨ Features

- **Hero Section**: Particle canvas animation, animated gradients, and parallax effects
- **Projects Grid**: Data-driven project cards with modal details and image carousel
- **Skills Display**: Categorized skills with proficiency levels
- **Experience Timeline**: Chronological work history
- **Contact Form**: Cloudflare Turnstile protection, rate limiting, SendGrid integration
- **Accessibility**: WCAG 2.1 AA compliant, respects reduced motion preferences
- **Performance**: Lighthouse scores ≥95, optimized bundle size

## 🚀 Quick Start

```bash
# Install dependencies
npm install
cd api && npm install && cd ..

# Set up environment variables
cp .env.example .env.local
cp local.settings.example.json local.settings.json
# Edit these files with your values

# Start development server
npm run dev

# Or with API
npm run swa:start
```

## 📁 Project Structure

```
├── .github/workflows/     # CI/CD pipeline
├── api/                   # Azure Functions API
│   ├── contact/           # Contact form endpoint
│   └── shared/            # Shared utilities
├── public/                # Static assets
├── src/
│   ├── assets/            # Project images
│   ├── data/              # JSON data files
│   ├── js/                # JavaScript modules
│   ├── styles/            # Tailwind CSS
│   └── index.html         # Main page
├── tests/                 # Test suite
└── docs/                  # Documentation
```

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript ES2022
- **Styling**: Tailwind CSS 3.4
- **Build**: Vite 5
- **API**: Azure Functions v4 (TypeScript, Node.js 20)
- **Email**: SendGrid
- **CAPTCHA**: Cloudflare Turnstile
- **Testing**: Vitest
- **Linting**: ESLint 9, Prettier 3

## 📝 Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start development server |
| `npm run build`         | Build for production     |
| `npm run test`          | Run tests                |
| `npm run test:coverage` | Run tests with coverage  |
| `npm run lint`          | Lint code                |
| `npm run format`        | Format code              |

## 🔧 Configuration

### Frontend (.env.local)

```env
VITE_TURNSTILE_SITE_KEY=your-site-key
```

### API (local.settings.json)

```json
{
  "Values": {
    "SENDGRID_API_KEY": "SG.xxx",
    "CONTACT_TO_EMAIL": "you@example.com",
    "CONTACT_FROM_EMAIL": "no-reply@example.com",
    "TURNSTILE_SECRET_KEY": "your-secret"
  }
}
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) - System design and patterns
- [Usage Guide](docs/USAGE.md) - Setup, development, and deployment
- [Suggestions](docs/SUGGESTIONS.md) - Future improvement ideas

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage (must meet 75% threshold)
npm run test:coverage
```

## 🚢 Deployment

The project automatically deploys to Azure Static Web Apps when pushing to `main`:

1. Configure `AZURE_STATIC_WEB_APPS_API_TOKEN` secret in GitHub
2. Set environment variables in Azure Portal
3. Push to `main` branch

## 📄 License

MIT
