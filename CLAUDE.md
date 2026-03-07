# Pikd — Agent Context

## Project
Photo voting app for teens/young adults. Expo + React Native + TypeScript + Supabase.

**Path:** `/Users/lionvit/claude/pikd/pikd/`

**Stack:**
- Expo SDK 55 + Expo Router (file-based routing)
- React Native 0.83 / React 19
- TypeScript strict
- Supabase (auth, postgres, storage)
- react-native-reanimated v4 (already installed)

## Supabase
- Project URL and anon key are in `.env.local` (gitignored)
- See `.env.example` for required env vars
- Migrations: `supabase/migrations/` — numbered SQL files

## Key Files
| File | Purpose |
|---|---|
| `lib/supabase.ts` | Supabase client singleton |
| `lib/env.ts` | ENV / IS_PROD constants |
| `context/AuthContext.tsx` | Session state, signInAnonymously, signOut |
| `hooks/useAuth.ts` | Auth hook |
| `types/database.ts` | Supabase DB types |

## Import Alias
`@/` maps to the project root (configured in `tsconfig.json`).

## Conventions
- **No `StyleSheet.create`** in new components — use inline styles or Themed components
- Always use `FeedPhoto` type (not raw `Photo`) in feed-related code
- Optimistic UI for votes: update state immediately, revert on DB error
- `detectSessionInUrl: false` — expo-router owns deep links; magic link code passed manually to `exchangeCodeForSession`

## Branch Naming
`feature/issue-{N}-{slug}` (e.g. `feature/issue-3-supabase-client`)

## Commit Convention
`feat: ... Closes #{N}` or `chore: ...`

## Architecture Decisions
- **Anonymous auth first**: zero-friction onboarding; `linkIdentity` upgrades guest → real
- **`vote_count` denormalized**: DB triggers keep it in sync
- **Optimistic voting**: tap response <16ms; revert on DB error
- **24hr expiry via RLS**: `where expires_at > now()`
- **`expo-image`** for feed images (already installed as transitive dep)

## Implementation Order
#1 env → #2 repo → #3 packages → #4 schema → #5 auth context → #6 magic link → #7 dark theme → #8 UI components → #9 feed → #10 upload → #11 leaderboard → #12 profile
