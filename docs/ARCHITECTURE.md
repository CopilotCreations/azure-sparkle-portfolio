# Architecture Documentation

## Overview

Azure Sparkle Portfolio is a single-page personal developer portfolio website built with vanilla JavaScript and deployed on Azure Static Web Apps. The application consists of two main components:

1. **Frontend**: A static website built with Vite, Tailwind CSS, and vanilla JavaScript
2. **API**: Azure Functions v4 for handling contact form submissions

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Azure Static Web Apps                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────┐    ┌─────────────────────────────────────┐ │
│  │      Static Frontend        │    │        Azure Functions API          │ │
│  │                              │    │                                     │ │
│  │  ┌─────────────────────┐    │    │  ┌─────────────────────────────┐   │ │
│  │  │      index.html     │    │    │  │      POST /api/contact      │   │ │
│  │  └─────────────────────┘    │    │  │                             │   │ │
│  │  ┌─────────────────────┐    │    │  │  ┌─────────────────────┐   │   │ │
│  │  │    JS Modules       │    │    │  │  │    Validation       │   │   │ │
│  │  │  - particles.js     │    │    │  │  └─────────────────────┘   │   │ │
│  │  │  - parallax.js      │    │    │  │  ┌─────────────────────┐   │   │ │
│  │  │  - scrollspy.js     │    │    │  │  │    Rate Limiting    │   │   │ │
│  │  │  - modal.js         │    │    │  │  └─────────────────────┘   │   │ │
│  │  │  - carousel.js      │    │    │  │  ┌─────────────────────┐   │   │ │
│  │  │  - form.js          │────┼────┼──▶  │  Turnstile Verify   │   │   │ │
│  │  │  - api.js           │    │    │  │  └─────────────────────┘   │   │ │
│  │  │  - render.js        │    │    │  │  ┌─────────────────────┐   │   │ │
│  │  └─────────────────────┘    │    │  │  │   SendGrid Email    │   │   │ │
│  │                              │    │  │  └─────────────────────┘   │   │ │
│  │  ┌─────────────────────┐    │    │  └─────────────────────────────┘   │ │
│  │  │    JSON Data        │    │    │                                     │ │
│  │  │  - projects.json    │    │    └─────────────────────────────────────┘ │
│  │  │  - skills.json      │    │                                           │
│  │  │  - experience.json  │    │                                           │
│  │  └─────────────────────┘    │                                           │
│  └─────────────────────────────┘                                            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                    │                                    │
                    ▼                                    ▼
          ┌─────────────────┐                  ┌─────────────────┐
          │   Cloudflare    │                  │    SendGrid     │
          │   Turnstile     │                  │      API        │
          └─────────────────┘                  └─────────────────┘
```

## Directory Structure

```
azure-sparkle-portfolio/
├── .github/workflows/          # CI/CD pipeline configuration
│   └── azure-static-web-apps.yml
├── api/                        # Azure Functions API
│   ├── contact/                # Contact form endpoint
│   │   ├── function.json       # Function binding configuration
│   │   └── index.ts            # HTTP handler
│   ├── shared/                 # Shared API utilities
│   │   ├── validation.ts       # Request validation
│   │   ├── rateLimit.ts        # Rate limiting logic
│   │   ├── turnstile.ts        # Turnstile verification
│   │   ├── sendgrid.ts         # Email sending
│   │   ├── response.ts         # Response helpers
│   │   └── logger.ts           # Logging utilities
│   ├── host.json               # Azure Functions host configuration
│   ├── package.json            # API dependencies
│   └── tsconfig.json           # TypeScript configuration
├── public/                     # Static assets (copied as-is)
│   ├── robots.txt
│   ├── resume.pdf
│   ├── og-image.png
│   └── favicons/
├── src/                        # Frontend source code
│   ├── assets/projects/        # Project images
│   ├── data/                   # JSON data files
│   │   ├── projects.json
│   │   ├── skills.json
│   │   └── experience.json
│   ├── js/                     # JavaScript modules
│   │   ├── main.js             # Application entry point
│   │   ├── particles.js        # Particle animation system
│   │   ├── parallax.js         # Parallax effects
│   │   ├── scrollspy.js        # Navigation highlighting
│   │   ├── modal.js            # Project modal
│   │   ├── carousel.js         # Image carousel
│   │   ├── form.js             # Contact form handling
│   │   ├── api.js              # HTTP utilities
│   │   └── render.js           # DOM rendering functions
│   ├── styles/
│   │   └── tailwind.css        # Tailwind entry point
│   └── index.html              # Main HTML file
├── tests/                      # Test suite
│   ├── unit/
│   │   ├── api/                # API unit tests
│   │   └── frontend/           # Frontend unit tests
│   └── integration/            # Integration tests
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md         # This file
│   ├── USAGE.md                # User guide
│   └── SUGGESTIONS.md          # Future improvements
├── package.json                # Project dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── vitest.config.js            # Test configuration
├── tsconfig.json               # TypeScript configuration
└── staticwebapp.config.json    # Azure Static Web Apps configuration
```

## Frontend Architecture

### Module Responsibilities

| Module         | Purpose                                               |
| -------------- | ----------------------------------------------------- |
| `main.js`      | Application entry point; bootstraps all modules       |
| `particles.js` | Canvas-based particle animation with connection lines |
| `parallax.js`  | Pointer-move and scroll-based parallax effects        |
| `scrollspy.js` | IntersectionObserver-based navigation highlighting    |
| `modal.js`     | Project detail modal with focus trapping              |
| `carousel.js`  | Image carousel navigation                             |
| `form.js`      | Contact form validation and submission                |
| `api.js`       | HTTP request utilities with timeout handling          |
| `render.js`    | Pure functions for DOM rendering                      |

### Design Patterns

1. **ES Modules**: Each feature is isolated in its own module to prevent global scope pollution and enable testability.

2. **Pure Rendering Functions**: `render.js` exports functions that accept JSON data and return DOM nodes without making network calls.

3. **State Machine for Modal**: The modal maintains explicit states (`closed`, `opening`, `open`, `closing`) to avoid double-open/close bugs.

4. **Dependency Inversion**: `api.js` exports `postJson()` used by `form.js`, making API transport mockable in tests.

### Data Flow

```
┌──────────────────┐     ┌────────────────┐     ┌─────────────────┐
│   JSON Data      │────▶│   render.js    │────▶│    DOM Nodes    │
│  projects.json   │     │                │     │                 │
│  skills.json     │     │ renderProjects │     │  Projects Grid  │
│  experience.json │     │ renderSkills   │     │  Skills Grid    │
└──────────────────┘     │ renderExp...   │     │  Timeline       │
                         └────────────────┘     └─────────────────┘
```

## API Architecture

### Request Processing Pipeline

```
Incoming Request
       │
       ▼
┌──────────────────┐
│ Content-Type     │──── 415 if not application/json
│ Validation       │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Body Validation  │──── 400 + VALIDATION_ERROR
│ (validation.ts)  │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Rate Limit Check │──── 429 + RATE_LIMIT
│ (rateLimit.ts)   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Turnstile Verify │──── 400 + TURNSTILE_FAILED
│ (turnstile.ts)   │
└──────────────────┘
       │
       ▼
┌──────────────────┐
│ Send Email       │──── 502 + EMAIL_SEND_FAILED
│ (sendgrid.ts)    │
└──────────────────┘
       │
       ▼
   200 + ok: true
```

### Rate Limiting

The API uses a fixed-window counter algorithm for rate limiting:

- **Window Size**: 60 seconds (configurable via `RATE_LIMIT_WINDOW_SECONDS`)
- **Max Requests**: 5 per IP per window (configurable via `RATE_LIMIT_MAX_REQUESTS`)
- **Storage**: In-memory Map (resets on cold start)

**Limitation**: Rate limit state is per-instance and does not synchronize across Azure Functions instances.

### Logging

All requests are logged as JSON with the following fields:

```json
{
  "timestamp": "2024-01-15T12:00:00.000Z",
  "level": "INFO",
  "route": "/api/contact",
  "method": "POST",
  "correlationId": "uuid-v4",
  "clientIp": "192.168.1.1",
  "status": 200,
  "latencyMs": 150,
  "errorCode": null
}
```

**Privacy**: Message content is never logged; only message length and subject length are recorded.

## Security Architecture

### Content Security Policy

```
default-src 'self';
script-src 'self' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://challenges.cloudflare.com;
frame-src https://challenges.cloudflare.com;
base-uri 'self';
form-action 'self';
```

### Security Measures

1. **Input Validation**: Server-side validation is authoritative; client-side mirrors constraints.
2. **CAPTCHA**: Cloudflare Turnstile protects the contact form.
3. **Rate Limiting**: 5 requests per 60 seconds per IP.
4. **XSS Prevention**: All user content is HTML-escaped before rendering.
5. **CORS**: Same-origin only (no explicit CORS headers).
6. **Security Headers**: X-Content-Type-Options, Referrer-Policy, X-Frame-Options.

## Deployment Architecture

### Azure Static Web Apps

- **App Location**: `/` (Vite builds from `src/`)
- **Output Location**: `dist/`
- **API Location**: `api/`

### CI/CD Pipeline

```
Push to main/PR
      │
      ▼
┌─────────────────┐
│ Checkout        │
│ Setup Node 20   │
│ npm ci          │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Format Check    │
│ Lint            │
│ Test + Coverage │
│ Typecheck       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Build Frontend  │
│ Build API       │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Deploy to Azure │
│ Static Web Apps │
└─────────────────┘
```

### Environment Variables

| Variable                    | Environment | Description                          |
| --------------------------- | ----------- | ------------------------------------ |
| `VITE_TURNSTILE_SITE_KEY`   | Frontend    | Turnstile widget site key            |
| `SENDGRID_API_KEY`          | API         | SendGrid API key                     |
| `CONTACT_TO_EMAIL`          | API         | Recipient email address              |
| `CONTACT_FROM_EMAIL`        | API         | Sender email address                 |
| `TURNSTILE_SECRET_KEY`      | API         | Turnstile verification secret        |
| `RATE_LIMIT_WINDOW_SECONDS` | API         | Rate limit window (default: 60)      |
| `RATE_LIMIT_MAX_REQUESTS`   | API         | Max requests per window (default: 5) |

## Performance Considerations

### Frontend

- **Bundle Size Target**: ≤150KB gzipped
- **Lighthouse Targets**: All scores ≥95
- **LCP Target**: ≤2.5s on mobile

### API

- **P95 Latency Target**: ≤1200ms (excluding SendGrid)
- **Total P95 Target**: ≤2500ms (including SendGrid)

### Optimizations

1. **Reduced Motion**: Animations respect `prefers-reduced-motion`
2. **Responsive Particles**: Fewer particles on mobile devices
3. **Lazy Loading**: Images loaded only when modal opens
4. **Minification**: Vite terser plugin for production builds
