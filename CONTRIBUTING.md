# Contributing Guide

Welcome! This short guide explains the key conventions so a new contributor can be productive fast.

1) Routing and Navigation
- Source of truth: src/utils/routes.ts
  - BASE_ROUTES: neighborhood-agnostic base paths (e.g., '/calendar')
  - ROUTE_MAP: maps HighlightableItemType → base path
  - neighborhoodPath(): build /n/:id-prefixed paths safely
  - extractNeighborhoodId(), isOnBaseRoute(): helpers for context/guards
- Do NOT hardcode '/calendar', '/skills', etc. Import from routes.ts
- For item-level nav, use ItemNavigationService (services/navigation/ItemNavigationService.ts)

2) Toasts
- Canonical API: src/utils/toast.ts
  - showSuccessToast, showErrorToast, showInfoToast, showWarningToast
  - showToast, showLoadingToast, dismissToast
- Legacy adapter: src/hooks/use-toast.ts (DEPRECATED). Keep for back-compat only.
- App uses Sonner Toaster (components/ui/sonner.tsx); do not re-introduce shadcn toaster.

3) Data Fetching
- Neighborhood-scoped data: use src/hooks/useNeighborhoodQuery.ts
  - It injects the neighborhoodId into the query key and gates execution
  - Pass your base key (e.g., ['events']) and a function (neighborhoodId) => fetch
- Keep composite/complex hooks unchanged unless required.

4) Deep Links and Highlighting
- URL params: prefer `detail` + `type`; accept legacy `highlight` for compatibility
- Highlight attributes: data-{type}-id on DOM elements
- ItemNavigationService.handleDeepLinkParams() handles both.

5) Logging
- Use src/utils/logger.ts createLogger('module-name')
- Console is quiet by default; add ?debug=true to enable info/debug noise

6) Internal Links
- Use Link/NavLink inside the app to avoid full reloads

7) Types
- Tighten obvious anys when low-cost (do not enable strict globally)

Thanks for contributing!
