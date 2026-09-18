# 📐 KisanDirect Project Conventions & Guidelines

> **Repository**: `Farmer_selling_app`  
> Coding standards, naming conventions, architectural idioms, and design tokens to maintain code quality.

---

## 1. Code Architecture & Component Conventions

### 1.1 State-Based Navigation Idiom
- All full-page views receive an `onNavigate: (view: string, params?: any) => void` prop.
- To switch views, invoke `onNavigate('target-view-slug', { key: value })`.
- Do not import `react-router` or use `window.location.href = ...` (unless linking to external documentation).
- State-based view slugs follow kebab-case: `farmer-dashboard`, `buyer-marketplace`, `buyer-orders`, `coordinator-dashboard`, etc.

### 1.2 Bilingual UI Requirement
Every user-facing label, button, badge, or message **must** be localized:
```tsx
import { useLanguage } from '../../context/LanguageContext';

export const MyComponent: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <button>
      {language === 'ta' ? 'ஆர்டர் செய்க' : 'Place Order'}
    </button>
  );
};
```
- For standard common words, use `t('key')` from `LanguageContext`.
- For domain-specific contextual phrases, use the ternary `language === 'ta' ? '...' : '...'` pattern.

### 1.3 Design System & Semantic Color Tokens
Use curated Tailwind CSS semantic tokens. Avoid raw saturated colors:
- **Fresh Produce**: `emerald-500` / `emerald-600` (backgrounds: `bg-emerald-50`, borders: `border-emerald-200`)
- **Aging Produce**: `amber-500` / `amber-600` (backgrounds: `bg-amber-50`, borders: `border-amber-200`)
- **Urgent Perishable Sale**: `orange-500` / `orange-600` with subtle pulse (`animate-pulse`)
- **Expired Produce**: `rose-500` / `rose-600` (backgrounds: `bg-rose-50`, borders: `border-rose-200`)
- **Dark Elements & Banners**: Slate palette (`bg-slate-900`, `text-slate-100`) with subtle gradients.
- **Card Styling**: Rounded corners (`rounded-2xl` or `rounded-3xl`), border `border-slate-200/80`, shadow `shadow-xs` or `shadow-md`.

---

## 2. Backend & API Conventions

### 2.1 Route Organization & Naming
- All route files live in [`server/src/routes/`](file:///d:/Projects/Farmer_selling_app/server/src/routes/) and end with `Routes.ts` (e.g. `buyerRoutes.ts`, `farmerRoutes.ts`).
- Route paths follow RESTful plural nouns: `/api/farmers/batches`, `/api/buyers/demands`, `/api/orders/:id`.
- Handlers should be asynchronous and properly typed with `Request`, `Response`, or `AuthenticatedRequest`.

### 2.2 Transactions for Multi-Entity Mutations
Any operation that updates inventory, creates orders, or allocates payments **must** be wrapped in `prisma.$transaction`:
```typescript
return await prisma.$transaction(async (tx) => {
  // 1. Verify batch stock
  // 2. Decrement batch quantity
  // 3. Create order & order items
  // 4. Create escrow payment
});
```

### 2.3 Authentication & Role Guards
- Protect routes with `authenticateToken` middleware.
- Enforce role boundaries with `requireRole(['FARMER'])` or `requireRole(['BUYER'])`.
- Access the authenticated user via `req.user!`.

### 2.4 Service Decoupling
- Do not place heavy mathematical calculations (such as Haversine distance, suitability scoring, or shelf-life decay) directly inside route handlers.
- Delegate to the dedicated service in [`server/src/services/`](file:///d:/Projects/Farmer_selling_app/server/src/services/).

---

## 3. Client Service Layer Conventions

- All HTTP requests to backend endpoints must be routed through [`client/src/services/api.ts`](file:///d:/Projects/Farmer_selling_app/client/src/services/api.ts).
- Never call raw `fetch('/api/...')` inside React components. Add a method to `api.ts` first:
```typescript
public async getMyResource(id: string): Promise<MyResourceType> {
  return this.request<MyResourceType>(`/my-resource/${id}`);
}
```

---

## 4. Reusable UI Primitives

Before creating a new UI component, check if an existing shared component can be reused:
- **`FreshnessBadge`**: For all produce batch status countdowns.
- **`FairPriceGauge`**: For price transparency and benchmark comparisons.
- **`DeliveryMap`**: For SVG-based route visualization.
- **`VoiceListingModal`**: For speech-to-text input.
- **`DemoScenarioBar`**: For persona switching and live presentation scenarios.
