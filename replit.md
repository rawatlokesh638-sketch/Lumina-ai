# Lumina AI Companion

Lumina is a mobile AI thought partner with secure server-side Gemini access, account authentication, guided modes, and locally saved conversations.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- `GEMINI_API_KEY` — server-only Gemini credential, stored in Replit Secrets
- `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — managed Clerk authentication credentials

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/gemini-ai-companion/app/` — Expo Router screens for welcome, auth, chat, library, and profile
- `artifacts/gemini-ai-companion/constants/colors.ts` — Lumina light/dark palette
- `artifacts/gemini-ai-companion/lib/storage.ts` — AsyncStorage conversation persistence
- `artifacts/api-server/src/routes/ai.ts` — authenticated Gemini request boundary

## Architecture decisions

- Gemini credentials never ship to the Expo bundle; the mobile client sends authenticated requests to the API server.
- Clerk owns account creation, email verification, sessions, and bearer-token validation.
- Conversation history is local-first with a bounded 30-conversation archive for the first release.
- The initial AI model is `gemini-2.5-flash`, with a server-side boundary so the model can be changed without shipping a new client.

## Product

Users can create and verify an account, sign in securely, chat with Gemini, switch between Think/Write/Plan/Learn/Translate modes, revisit saved conversations, and sign out. The UI adapts to light/dark mode and mobile/web preview sizes.

## User preferences

- Keep all user credentials and AI keys out of source files and mobile builds.

## Gotchas

- Android/Google Play publishing is not handled by Replit's Expo Launch flow; the project is structured for a later Android build/export.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
