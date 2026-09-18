# ⚙️ KisanDirect Configuration Knowledge

> **Repository**: `Farmer_selling_app`  
> Inventory of environment variables, build configs, database connections, and deployment rules.  
> ⚠️ **CRITICAL SECURITY RULE**: Never check in actual secret values or passwords. Only document variable names, types, and purposes.

---

## 1. Environment Variables Inventory

Defined in [`.env.example`](file:///d:/Projects/Farmer_selling_app/.env.example) and parsed in [`server/src/config/env.ts`](file:///d:/Projects/Farmer_selling_app/server/src/config/env.ts):

| Variable Name | Required | Default Value | Purpose |
| :--- | :--- | :--- | :--- |
| `PORT` | Optional | `5000` | HTTP port on which the Express server listens. |
| `NODE_ENV` | Optional | `development` | Runtime environment (`development`, `production`, `test`). Determines Prisma query logging verbosity. |
| `DATABASE_URL` | **Required** | `file:./dev.db` | Main database connection string. Accepts PostgreSQL URI (Supabase pooler) or local SQLite URI (`file:./dev.db`). |
| `DIRECT_URL` | Optional | None | Direct PostgreSQL connection string bypassing PgBouncer connection poolers for Prisma schema migrations. |
| `SUPABASE_URL` | Optional | Supabase Project URL | API endpoint for Supabase backend services. |
| `SUPABASE_ANON_KEY` | Optional | Public Anon Key | Public API client key for anonymous Supabase interactions. |
| `SUPABASE_PUBLISHABLE_KEY` | Optional | Public Key | Public browser key for Supabase storage and auth. |
| `JWT_SECRET` | **Required** | Fallback Secret | HMAC SHA-256 secret key used to sign and verify user authentication tokens. |
| `JWT_EXPIRES_IN` | Optional | `7d` | Lifetime of issued JSON Web Tokens before re-authentication is required. |
| `DATA_GOV_IN_API_KEY` | Optional | `""` (Empty) | API key for Indian Government Open Data portal (`data.gov.in`) to fetch live Agmarknet APMC mandi prices. If empty, server uses calibrated deterministic mandi model. |
| `MAPS_API_KEY` | Optional | `mock_google_maps_key_demo` | API key for mapping, geocoding, and distance matrix services. |
| `PAYMENT_API_KEY` | Optional | `mock_razorpay_key_demo` | API key for payment gateway integration (Razorpay / UPI escrow). |
| `SMS_API_KEY` | Optional | `mock_fast2sms_key_demo` | API key for transactional SMS delivery (Fast2SMS). |
| `VOICE_API_KEY` | Optional | `mock_google_speech_key_demo` | API key for speech-to-text / text-to-speech services. |
| `FRONTEND_URL` | Optional | `http://localhost:5173` | Allowed origin for CORS in production deployments. |

---

## 2. Build & Runtime Configuration Files

### 2.1 Workspace Root
- **[`package.json`](file:///d:/Projects/Farmer_selling_app/package.json)**:
  - Defines npm workspaces: `server` and `client`.
  - Scripts:
    - `install:all`: Installs dependencies across both workspaces.
    - `dev:server`: Starts server with `tsx watch src/index.ts`.
    - `dev:client`: Starts Vite client dev server.
    - `build:server`: Runs `tsc` to compile TypeScript to `dist/`.
    - `build:client`: Runs `tsc && vite build` to compile frontend to `client/dist/`.
    - `db:generate`: `prisma generate` in server workspace.
    - `db:push`: `prisma db push` in server workspace.
    - `db:seed`: `tsx prisma/seed.ts` in server workspace.

### 2.2 Server Workspace (`server/`)
- **[`server/package.json`](file:///d:/Projects/Farmer_selling_app/server/package.json)**:
  - Runtime: Node.js with TypeScript via `tsx`.
  - Dependencies: `@prisma/client`, `express`, `cors`, `dotenv`, `jsonwebtoken`, `bcryptjs`.
- **[`server/tsconfig.json`](file:///d:/Projects/Farmer_selling_app/server/tsconfig.json)**:
  - Target: `ES2022`, Module: `NodeNext`, ModuleResolution: `NodeNext`.
  - Strict mode enabled (`"strict": true`).
  - Output directory: `./dist`.

### 2.3 Client Workspace (`client/`)
- **[`client/package.json`](file:///d:/Projects/Farmer_selling_app/client/package.json)**:
  - Runtime: React 18, Vite 6.
  - Dependencies: `lucide-react`, `recharts`, `clsx`, `tailwind-merge`.
- **[`client/vite.config.ts`](file:///d:/Projects/Farmer_selling_app/client/vite.config.ts)**:
  - React plugin configured.
  - Proxy configuration: Proxies `/api` requests to `http://localhost:5000`.
- **[`client/tailwind.config.js`](file:///d:/Projects/Farmer_selling_app/client/tailwind.config.js)**:
  - Content paths: `./index.html`, `./src/**/*.{js,ts,jsx,tsx}`.
  - Theme extensions: Semantic agricultural palette (`emerald` for fresh, `amber` for aging, `orange` for urgent sale).
- **[`client/vercel.json`](file:///d:/Projects/Farmer_selling_app/client/vercel.json)**:
  - SPA rewrite rule forwarding all routes to `/index.html`.

---

## 3. Database Switching Protocol

The application supports both cloud PostgreSQL and zero-setup local SQLite:

### Mode A: Cloud PostgreSQL (Supabase)
1. Ensure `server/prisma/schema.prisma` datasource is:
   ```prisma
   datasource db {
     provider  = "postgresql"
     url       = env("DATABASE_URL")
     directUrl = env("DIRECT_URL")
   }
   ```
2. Set `DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"` in `server/.env`.
3. Run `npm run db:push` followed by `npm run db:seed`.

### Mode B: Zero-Setup Local SQLite
1. Change datasource in `schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```
2. Run `npm run db:push` followed by `npm run db:seed`.
