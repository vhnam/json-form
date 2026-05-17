# AGENTS.md

Instructions for AI coding agents working in **json-form**. For human-oriented overview, see [README.md](README.md). For tutorials, how-tos, and architecture detail, see [docs/project-guide.md](docs/project-guide.md). For how to write `json.schema.json`, `ui.schema.json`, and `validation.schema.ts`, see [docs/form-assets.md](docs/form-assets.md).

## Project overview

**json-form** is a frontend-only TanStack Start app for researching [React JSON Schema Form (RJSF)](https://rjsf-team.github.io/react-jsonschema-form/) toward a **JSON Schema–first Form Builder**.

| Layer | Role |
| ----- | ---- |
| `src/assets/<experiment>/` | `json.schema.json`, `ui.schema.json`, `validation.schema.ts` per form experiment |
| `src/routes/` | TanStack Router file-based routes; lazy `*.lazy.tsx` pages render forms |
| `src/integration/shadcn/` | Local RJSF theme: `JsonSchemaForm`, `ThemedForm`, widgets, templates, fields |
| `src/integration/zod/` | Zod → RJSF error mapping (`createZodFormValidators`, `applyZodIssuesToFormValidation`) |
| `src/components/ui/` | Shadcn-style UI primitives (Base UI + Tailwind v4) |

**Stack:** React 19, TanStack Start/Router, RJSF 6, AJV8 (`Ajv2020`), Zod 4, Vite 8, TypeScript (strict), Vitest, ESLint (`@tanstack/eslint-config`), Prettier.

**Out of scope unless the user explicitly asks:** backends, APIs, persistence, authentication, TanStack Start server functions, protected routes.

**Package manager:** `pnpm` only (not npm/yarn).

This repo is **not** an Nx workspace. Use `pnpm` scripts below; do not assume `nx` targets exist here.

## Setup commands

```bash
pnpm install          # install dependencies
pnpm dev              # dev server → http://localhost:3000
pnpm build            # production build
pnpm preview          # preview production build
```

No `.env` or database setup is required for default development.

## Development workflow

- **Dev server:** `pnpm dev` (port **3000**, Vite + TanStack Start plugin).
- **Hot reload:** automatic via Vite.
- **Example forms:** open `/internal-triage-form` or `/payment-methods` after `pnpm dev`.

### Where to change code

| Task | Prefer editing |
| ---- | -------------- |
| New form experiment | `src/assets/<name>/`, `src/routes/<name>.lazy.tsx` |
| Field/widget appearance | `src/integration/shadcn/widgets/`, `templates/`, `theme.tsx` |
| Validation rules / messages | `src/assets/<experiment>/validation.schema.ts`, `src/integration/zod/` |
| Form UX (submit disable, error timing) | `src/integration/shadcn/themedForm.tsx`, `formValidationContext.tsx` |
| New Shadcn primitive | `pnpm dlx shadcn@latest add <component>` → `src/components/ui/` |

### Adding a form route (minimal pattern)

1. Create `src/assets/<experiment>/` with `json.schema.json`, optional `ui.schema.json`, and `validation.schema.ts`.
2. Add `src/routes/<experiment>.lazy.tsx` with `createLazyFileRoute('/<experiment>')`.
3. Wire validators at module scope and pass the **full** object from `createZodFormValidators` to `Form`:

```tsx
import Form from '@/integration/shadcn/form';
import { createZodFormValidators } from '@/integration/zod/createZodCustomValidate';
import { myZodSchema, type MyFormData } from '@/assets/<experiment>/validation.schema';

const customValidate = createZodFormValidators<MyFormData>(myZodSchema);

<Form
  schema={schema as unknown as RJSFSchema}
  uiSchema={uiSchema}
  customValidate={customValidate}
  onSubmit={handleSubmit}
/>
```

Do **not** configure `customizeValidator` in routes — `JsonSchemaForm` owns AJV setup.

Zod property paths must match JSON Schema property keys so errors attach to the right fields.

### Shadcn components

```bash
pnpm dlx shadcn@latest add <component>
```

Config: [components.json](components.json). Aliases use `@/components`, `@/lib/utils`.

## Testing instructions

```bash
pnpm test             # vitest run (single pass)
pnpm exec vitest      # watch mode (if you add tests)
```

- **Framework:** Vitest 4 + Testing Library (see `package.json` devDependencies).
- **Convention:** colocate as `*.test.ts` / `*.test.tsx` next to source (none in repo yet).
- Add or update tests when changing validation mapping, `resolveEnumOptions`, or other pure logic.
- There is no CI workflow in this repo; run checks locally before proposing commits.

## Code style

- **Language:** TypeScript, `strict: true`, `verbatimModuleSyntax: true`.
- **Imports:** use `@/*` → `./src/*` ([tsconfig.json](tsconfig.json)); prefer type-only imports where applicable.
- **React:** React 19, React Compiler enabled via Vite Babel preset.
- **Lint:** `pnpm lint` (ESLint flat config in [eslint.config.js](eslint.config.js)).
- **Format:** `pnpm format` (Prettier write + ESLint fix); `pnpm check` (Prettier check only).
- **Pre-commit:** [lefthook.yml](lefthook.yml) runs `pnpm format` on staged `*.{js,ts,jsx,tsx,css}`.
- **File layout:** one component per folder under `widgets/`, `templates/` with `index.ts` barrels; match existing patterns.
- **Scope discipline:** only change files required for the task; avoid unrelated refactors or new markdown unless asked.

## Build and deployment

```bash
pnpm build            # output via Vite/TanStack Start (standard dist)
pnpm preview          # serve production build locally
```

- RJSF, AJV, and date libraries are split into manual chunks in [vite.config.ts](vite.config.ts).
- No documented deployment target; treat as a research SPA unless the user specifies hosting.

## Validation architecture (agent-critical)

1. **AJV** — JSON Schema keywords in `json.schema.json` (wired inside `JsonSchemaForm`).
2. **Zod** — `createZodFormValidators` → `customValidate` + `isFormValid` (shared parse cache).

Default **`validationMode`** is `submitThenChange`: submit disabled until `isFormValid` passes; field errors hidden until submit attempt or form is complete, then live validation. Templates/widgets use `FormValidationContext` for error visibility and submit state.

For `options: [{ id, label }]` enums (non-standard), see `resolveEnumOptions.ts` and `payment-methods/json.schema.json`.

## Pull request / commit guidelines

- Run before finishing work: `pnpm lint`, `pnpm test`, and `pnpm check` (or `pnpm format` if you touched styled/linted files).
- **Do not create git commits** unless the user explicitly asks.
- Keep PRs focused on form integration, schemas, or routes in scope above.
- Reference example routes when introducing new patterns.

## Debugging tips

- Submit handlers on example routes `console.log(formData)` — no network.
- In dev, missing `isFormValid` with `submitThenChange` logs a console error from `ThemedForm`.
- Cast imported JSON schema as `schema as unknown as RJSFSchema` when TS complains.
- For complex `oneOf` / nested objects, see contexts under `src/integration/shadcn/context/`.

## Project-specific rules

Also enforced via [.cursorrules](.cursorrules):

- Frontend-only; no auth by default.
- JSON Schema drives structure; uiSchema + theme handle presentation.
- Prefer `src/integration/shadcn`, `src/routes`, and `src/assets` for form-related work.

## Optional agent skills

Project skills under `.agents/skills/` (invoke when relevant):

- `shadcn` — UI components and registry
- `documentation-writer` — Diátaxis docs (e.g. `docs/project-guide.md`)
- `tanstack-start-best-practices` — only when expanding into full-stack patterns (out of default scope)
