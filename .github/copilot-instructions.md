# BeSy-Frontend - Copilot Coding Agent Instructions

## Repository Overview
BeSy-Frontend is an Angular 20+ web application for the BeSy ordering system at HS Esslingen. It's a single-page application (SPA) using Angular Material UI components, Tailwind CSS for styling, and OAuth2/OIDC for authentication with Keycloak. The app interfaces with a backend API for order management, persons, suppliers, and cost centers.

**Project Type:** Angular 20 Single Page Application  
**Size:** ~98 TypeScript files, ~22 components, ~4.3MB source code  
**Key Technologies:** Angular 20.1.3, TypeScript 5.8.3, Angular Material, Tailwind CSS 4.1.11, RxJS 7.8, angular-oauth2-oidc  
**Runtime:** Node.js 22 (as per Dockerfile), npm 10.8+  
**Testing:** Karma + Jasmine with ChromeHeadless

## Critical Build Information

### Installation & Build Commands
**ALWAYS run `npm install` before building.** The project uses npm (not yarn or pnpm).

```bash
# Install dependencies (takes ~7-50 seconds)
npm install

# Development build (RECOMMENDED for local work) - takes ~12 seconds
npm run build -- --configuration=development

# Production build - FAILS without internet access due to Google Fonts inlining
# Use --optimization=false to bypass font inlining issue
npm run build -- --optimization=false

# Test configuration build - also requires --optimization=false
npm run build -- --configuration=test --optimization=false

# Development server (runs on http://localhost:4200/)
npm start
# or
ng serve

# Watch mode for continuous building
npm run watch
```

### Important Build Notes
1. **Font Inlining Issue:** Production builds (`ng build` or `--configuration=production/test`) fail in environments without internet access with error: `Inlining of fonts failed... fonts.googleapis.com`. **SOLUTION:** Always use `--optimization=false` flag OR use `--configuration=development`.

2. **Build Output:** Build artifacts are generated in `dist/besy-frontend/` directory.

3. **Build Time:** Development builds take ~12 seconds, initial npm install takes 7-50 seconds depending on cache.

### Testing
The project has ~50 test files but **some tests have TypeScript errors** (e.g., `GenericTableComponent` requires type argument). Tests may not pass cleanly.

```bash
# Run tests (has known TypeScript errors in some test files)
npm test -- --no-watch --browsers=ChromeHeadless

# Interactive test mode
npm test
```

**Note:** Tests currently fail due to TypeScript errors in test files. This is a known issue with the existing codebase.

### Linting & Code Style
- **No linting tools configured** (no ESLint, TSLint, or Prettier in package.json)
- Code style is enforced via `.editorconfig`:
  - 2 spaces indentation
  - Single quotes for TypeScript
  - UTF-8 encoding
  - Insert final newline
- TypeScript uses strict mode (see `tsconfig.json`)

## Project Architecture

### Directory Structure
```
/
├── .github/
│   └── workflows/
│       └── build-and-push.yml    # CI/CD: Docker build & push to GitHub Packages
├── src/
│   ├── app/
│   │   ├── api/                  # Auto-generated OpenAPI client (DO NOT EDIT)
│   │   │   ├── core/             # API core utilities (request, OpenAPI config)
│   │   │   ├── models/           # DTO models (AddressRequestDTO, OrderResponseDTO, etc.)
│   │   │   └── services/         # API services (OrdersService, PersonsService, etc.)
│   │   ├── components/           # Reusable UI components
│   │   │   ├── generic-table/    # Generic table component with sorting/filtering
│   │   │   ├── form-component/   # Dynamic form builder
│   │   │   ├── navbar-button/    # Navigation bar button
│   │   │   └── ...               # address-form, card, chip-selection, etc.
│   │   ├── pages/                # Page components (routed)
│   │   │   ├── order/create-order-page/
│   │   │   ├── persons/persons-page/
│   │   │   ├── suppliers/        # suppliers-page, edit-suppliers-page
│   │   │   ├── cost-center/
│   │   │   ├── homepage/
│   │   │   ├── unauthorized/
│   │   │   └── not-found/
│   │   ├── services/             # Angular services
│   │   │   ├── authentication.service.ts  # OAuth/Keycloak authentication
│   │   │   └── wrapper-services/ # API wrapper services
│   │   ├── guards/               # Route guards
│   │   │   ├── default.guard.ts  # Requires 'besy' role
│   │   │   └── approve-orders.guard.ts  # Requires 'dekanat' role
│   │   ├── configs/              # Form configurations
│   │   │   └── item-config.ts    # Item form field definitions
│   │   ├── models/               # TypeScript interfaces/types
│   │   ├── mockups/              # Demo components (table-demo, filter-demo)
│   │   ├── app.config.ts         # Application configuration & OAuth setup
│   │   ├── app.routes.ts         # Route definitions
│   │   └── app.component.ts      # Root component
│   ├── environments/             # Environment configurations
│   │   ├── environment.ts        # Production (api.besy.hs-esslingen.com)
│   │   ├── environment.development.ts  # Development (localhost:3000)
│   │   └── environment.test.ts   # Test (api.test.besy.hs-esslingen.com)
│   ├── assets/                   # Static assets
│   ├── styles.scss               # Global styles
│   └── index.html                # Main HTML
├── angular.json                  # Angular CLI configuration
├── tsconfig.json                 # TypeScript configuration (strict mode)
├── package.json                  # Dependencies & scripts
├── Dockerfile                    # Multi-stage Docker build (Node 22 + nginx)
├── nginx.conf                    # Nginx configuration for deployment
└── README.md                     # Basic Angular CLI documentation
```

### Key Configuration Files
- **angular.json**: Build configurations (development/test/production), budget limits (2MB warning, 5MB error)
- **tsconfig.json**: Strict TypeScript settings, ES2022 target
- **package.json**: Scripts (start, build, watch, test), dependencies
- **.editorconfig**: Code style settings
- **Dockerfile**: Build profile argument (production/test), uses Node 22

### Authentication & Authorization
- **OAuth2/OIDC** via `angular-oauth2-oidc` library
- **Identity Provider:** Keycloak at `auth.insy.hs-esslingen.com/realms/insy`
- **Client IDs:** `besy` (prod), `besy-test` (test), `besy-dev` (dev)
- **Required Role:** `besy` (checked by `DefaultGuard`)
- **Admin Role:** `dekanat` (checked by `ApproveOrdersGuard`)
- **Authentication Service:** `src/app/services/authentication.service.ts`
  - Handles login/logout, token refresh, role checks
  - Methods: `login()`, `logout()`, `isAuthenticated()`, `isAuthorizedFor(role)`, `getRoles()`, `getUsername()`

### API Integration
- **API Client:** Auto-generated from OpenAPI spec using `openapi-typescript-codegen` (version 0.29.0)
- **DO NOT MANUALLY EDIT** files in `src/app/api/` - they are auto-generated
- **API Base URL:** Configured in environment files (`environment.apiUrl`)
  - Development: `http://localhost:3000/api/v1`
  - Test: `https://api.test.besy.hs-esslingen.com/api/v1`
  - Production: `https://api.besy.hs-esslingen.com`
- **Services:** OrdersService, PersonsService, SuppliersService, CostCentersService, etc.

### Routing
Routes are defined in `src/app/app.routes.ts`. Key routes:
- `/` - Homepage
- `/orders/create` - Create order page
- `/persons` - Persons management
- `/suppliers` - Suppliers list
- `/suppliers/:id/edit` - Edit supplier
- `/cost-centers` - Cost centers
- `/unauthorized` - Shown when user lacks required role
- `/not-found` - 404 page (also catches `**`)

### Environment-Specific Builds
Angular uses **file replacement** to swap environment files:
- **Development:** `environment.development.ts` (localhost API)
- **Test:** `environment.test.ts` (test API server)
- **Production:** `environment.ts` (production API server)

Build with specific environment: `ng build --configuration=development|test|production`

## CI/CD Pipeline
**GitHub Actions Workflow:** `.github/workflows/build-and-push.yml`
- **Triggers:** Push to main/test branches, tags, pull requests, manual dispatch
- **Process:**
  1. Checkout repository
  2. Set up Docker Buildx
  3. Determine build profile (test for test branch, production for main)
  4. Build Docker image with profile: `docker build --build-arg PROFILE=<profile>`
  5. Push to GitHub Container Registry (ghcr.io) as `ghcr.io/besy-rewrite/besy-frontend-<profile>:latest`
- **Docker Build:**
  - Stage 1: Node 22, npm install, `ng build --configuration ${PROFILE}`
  - Stage 2: nginx:alpine, copy build artifacts, serve on port 80

## Common Development Tasks

### Creating Components
Use Angular CLI for scaffolding:
```bash
ng generate component component-name
ng generate service service-name
ng generate guard guard-name
```
Components use SCSS styling and standalone component architecture.

### Adding Dependencies
```bash
npm install <package-name>
# Always commit package.json and package-lock.json
```

### Making Code Changes
1. Ensure dependencies are installed: `npm install`
2. Start dev server for live reload: `npm start`
3. Make changes to TypeScript/HTML/SCSS files
4. Build to verify no compilation errors: `npm run build -- --configuration=development`
5. **Do not run `npm test`** unless fixing test issues (tests have known errors)

### Working with Forms
- Form configurations are in `src/app/configs/` (e.g., `item-config.ts`)
- Dynamic form component: `src/app/components/form-component/`
- Uses Angular Material form fields and Reactive Forms

### Working with Tables
- Generic table component: `src/app/components/generic-table/`
- Supports sorting, filtering, pagination
- Uses Angular Material table components

## Validation & Quality Checks

### Pre-Commit Checklist
1. **Build succeeds:** `npm run build -- --configuration=development` (should complete in ~12 seconds)
2. **No TypeScript errors:** Check build output for compilation errors
3. **Code style:** Follow .editorconfig rules (2 spaces, single quotes, UTF-8)
4. **Environment files:** If API URLs changed, update all three environment files
5. **API changes:** If API models/services need updates, regenerate using openapi-typescript-codegen

### Common Pitfalls
- **Forgetting `npm install`** after pulling changes with new dependencies
- **Editing auto-generated API files** in `src/app/api/`
- **Using production build** without `--optimization=false` in offline environments
- **Assuming tests pass** (they don't due to existing TypeScript errors)
- **Missing environment configuration** when adding new API endpoints

## Additional Notes
- **No E2E tests configured** (Angular CLI mentions `ng e2e` but no framework is set up)
- **Security vulnerabilities** reported by npm audit (6 low, 2 high) - run `npm audit fix` if addressing security
- **Code scaffolding:** Project uses component/directive/service type separators (configured in angular.json schematics)
- **Analytics disabled** in Angular CLI (`.cli.analytics = false`)

## Trust These Instructions
These instructions have been validated by building and testing the repository. Only search for additional information if:
1. A command fails unexpectedly
2. Project structure has significantly changed
3. New build requirements are introduced
4. These instructions are incomplete or incorrect

Always start with `npm install`, use `--configuration=development` for builds, and avoid running tests unless specifically fixing test issues.
