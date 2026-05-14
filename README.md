# json-form

TanStack Start app for experimenting with **JSON Schema** forms using [React JSON Schema Form (RJSF)](https://github.com/rjsf-team/react-jsonschema-form), a **Shadcn-style UI** (Base UI + Tailwind), and **AJV8** validation.

## Stack

- [TanStack Start](https://tanstack.com/start) / [TanStack Router](https://tanstack.com/router) (file-based routes in `src/routes`)
- [@rjsf/core](https://rjsf-team.github.io/react-jsonschema-form/) with [@rjsf/validator-ajv8](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/validation/)
- Local Shadcn-themed integration: `src/integration/shadcn` (templates, widgets, theme wired to `src/components/ui`)
- Tailwind CSS v4, Vitest, ESLint, Prettier

## Getting started

Install dependencies and run the dev server (port **3000**):

```bash
pnpm install
pnpm dev
```

## Example route

- **`/internal-triage-form`** — loads `src/assets/internal-triage-form.schema.json` and `internal-triage-form.ui.json` into the integrated `Form` from `#/integration/shadcn/src`.

The form component is imported as:

```tsx
import Form from '@/integration/shadcn/src'
```

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Vite dev server on port 3000   |
| `pnpm build`   | Production build               |
| `pnpm preview` | Preview production build       |
| `pnpm test`    | Vitest (run once)              |
| `pnpm lint`    | ESLint                         |
| `pnpm format`  | Prettier write + ESLint fix    |
| `pnpm check`   | Prettier check (no write)      |

## Shadcn UI components

Add or update UI primitives with the latest Shadcn CLI:

```bash
pnpm dlx shadcn@latest add button
```

## Learn more

- [TanStack Start](https://tanstack.com/start)
- [RJSF documentation](https://rjsf-team.github.io/react-jsonschema-form/)
