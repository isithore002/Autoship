# AutoShop Agent Backend

Backend service for the AutoShop agent system.

## Structure

- `src/api/` - REST endpoints for runs/tools
- `src/agents/` - planner/builder/vibecoder/browserQA logic
- `src/tools/` - read/write/list/run_command/deploy/browser_smoketest
- `src/workflow/` - orchestration engine + state machine
- `src/artifacts/` - artifact builders
- `src/db/` - firestore admin config
- `src/config/` - env schema, constants
- `src/types/` - TypeScript types

## Development

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

