# AutoShop Agent

Autonomous software building orchestrator that turns high-level software requests into fully deployed applications.

## 🏗️ Monorepo Structure

```
autoshop-agent/
├─ apps/
│  ├─ dashboard/          # Next.js web UI (AutoShip)
│  └─ generated/          # Generated projects live here
├─ backend/               # Agent backend/tool-runner
├─ artifacts/              # Proof bundles (per run)
├─ docs/                   # Documentation
└─ scripts/                # Development scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Run dashboard + backend together
./scripts/dev.sh

# Or run individually
pnpm --filter dashboard dev
pnpm --filter backend dev
```

### Build

```bash
# Build all packages (no API keys required)
pnpm build
```

**Note:** The build process does NOT require API keys. It's just TypeScript compilation and Vite bundling.

### Scripts

- `pnpm dev` - Start all apps in development mode
- `pnpm build` - Build all packages (no API keys needed)
- `pnpm lint` - Lint all packages
- `pnpm test` - Run tests
- `pnpm format` - Format code

## 📦 Workspaces

- `@autoshop-agent/dashboard` - React + Vite frontend
- `@autoshop-agent/backend` - Express backend with agent logic

## 🔧 Configuration

### Building Without API Keys

**You can build the application without any API keys!** The build process only compiles TypeScript and bundles the frontend - it doesn't make any API calls.

### Runtime Configuration (Optional)

For running the application with real AI features (instead of simulation mode), create a `.env` file:

```bash
cp .env.example .env
```

Environment variables (all optional):
- `GEMINI_API_KEY` - Google Gemini API key (only needed for real AI, not simulation mode)
- `PORT` - Backend port (default: 5050)
- `SIMULATION_MODE` - Set to `true` to use simulation mode without API keys (default: `true`)
- `MAX_FIX_RETRIES` - Maximum retry attempts (default: 3)
- `FIREBASE_PROJECT_ID` - Firebase project ID (optional)
- `FIREBASE_CLIENT_EMAIL` - Firebase service account email (optional)
- `FIREBASE_PRIVATE_KEY` - Firebase private key (optional)

**By default, the application runs in simulation mode** which doesn't require any API keys. The simulation mode provides a complete demo experience without making real API calls.

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter dashboard test:watch
```

## 📝 Documentation

See `docs/` directory for:
- `architecture.md` - System architecture
- `demo_prompts.md` - Example prompts
- `devpost_draft.md` - Devpost submission draft

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

MIT

