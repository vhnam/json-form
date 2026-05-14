# json-form — project guide

This guide follows the [Diátaxis](https://diataxis.fr/) structure: **tutorial** (learn by doing), **how-to** (solve a task), **reference** (facts), **explanation** (concepts). It reflects the repository as of the last review.

**Audience:** developers working on this repo or cloning it to experiment with JSON Schema forms.

**Scope:** frontend form experiments with RJSF, local Shadcn integration, TanStack Router routes, and assets under `src/assets`. Out of scope unless explicitly requested: backends, auth, server functions, persistence.

---

## Tutorial: run the app and open an example form

Goal: confirm the workspace runs and see a real schema-driven form.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the dev server (port **3000**):

   ```bash
   pnpm dev
   ```

3. In the browser, open one of the bundled examples (each lazy route imports JSON from `src/assets/…` and uses the same `Form` + `customizeValidator` pattern):

   | URL                     | Title                 | Assets folder                 | Useful to see                          |
   | ----------------------- | --------------------- | ----------------------------- | -------------------------------------- |
   | `/internal-triage-form` | Internal Triage Form  | `internal-triage-form/`       | A fuller triage-style schema           |
   | `/payment-methods`      | Payment Methods       | `payment-methods/`            | Arrays, `options` id/label, `oneOf`    |

4. Submit the form. The route’s `onSubmit` handler currently logs `formData` to the console (no network call).

You have now exercised the main research loop: **schema + uiSchema + themed `Form` + AJV validator**.

---

## How-to guides

### Add a new experimental form route

1. Add JSON Schema and optional `uiSchema` under `src/assets/<your-experiment>/` (one folder per experiment keeps assets together).

2. Create a lazy route file under `src/routes/`, e.g. `my-form.lazy.tsx`, using `createLazyFileRoute` with a path string that matches the URL segment (e.g. `createLazyFileRoute('/my-form')` → `/my-form`).

3. Import `Form` from `@/integration/shadcn/form` (or `@/integration/shadcn` — same default export).

4. Import your JSON as modules (same pattern as `internal-triage-form.lazy.tsx` or `payment-methods.lazy.tsx`). Cast `schema` to `RJSFSchema` when TypeScript needs it.

5. Create a validator with `customizeValidator` from `@rjsf/validator-ajv8` (the examples use `Ajv2020` for draft 2020-12 features).

### Change how fields look

Presentation is layered on top of the schema:

- **Widgets** — control widgets for types like select, checkbox, radio, textarea, range, alt date: `src/integration/shadcn/widgets/`.

- **Templates** — layout and chrome (field rows, errors, array add/remove, submit): `src/integration/shadcn/templates/`.

- **Fields** — higher-level field components (e.g. `ArrayField`, `ObjectField`): `src/integration/shadcn/fields/`.

Register or swap implementations through `generateTheme()` in `src/integration/shadcn/theme.tsx`, which combines `generateFields`, `generateTemplates`, and `generateWidgets`.

### Id/label `options` and enum-backed widgets

Some experiments use a non-standard **`options: [{ id, label, description? }]`** shape (see `payment-methods/json.schema.json`) instead of only `enum` / `enumNames`. Select, radio, and checkboxes widgets resolve labels through **`resolveEnumOptions`** in `src/integration/shadcn/resolveEnumOptions.ts`, which also understands `enum`, `enumNames`, and `oneOf` const branches.

For **`type: "array"`** fields (e.g. multi-select checkboxes), RJSF often passes the **array** schema; enum metadata frequently lives on **`items`**. The resolver unwraps a single-object `items` schema so widgets still receive the right options.

### Add a Shadcn UI primitive

Use the project’s documented pattern:

```bash
pnpm dlx shadcn@latest add <component>
```

Primitives live under `src/components/ui` and are composed by the integration layer.

---

## Reference

### Repository layout (high signal)

| Path                      | Role                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/routes/`             | TanStack Router file-based routes; lazy routes for heavier pages                                        |
| `src/integration/shadcn/` | RJSF theme: `form.tsx`, `theme.tsx`, `fields/`, `templates/`, `widgets/`                                |
| `src/integration/shadcn/resolveEnumOptions.ts` | Shared enum / `options` / `oneOf` resolution for select, radio, and checkboxes widgets           |
| `src/integration/shadcn/context/` | React contexts used by fields/templates (e.g. checkbox nesting, object-field branches)          |
| `src/components/ui/`      | Shadcn-style UI primitives                                                                              |
| `src/assets/`             | JSON Schema and uiSchema bundles per experiment (`internal-triage-form/`, `payment-methods/`, …)      |
| `vite.config.ts`          | Vite + TanStack Start plugin, Tailwind v4, React Compiler (Babel), manual chunks for RJSF/AJV/date libs |

### Public integration API

From `src/integration/shadcn/index.ts`:

- `Form` (default), `generateForm`
- `Templates`, `generateTemplates`
- `Theme`, `generateTheme`
- `Widgets`, `generateWidgets`

`generateForm()` returns `withTheme(generateTheme())` from `@rjsf/core`, so consumers get a single themed component.

### Custom widgets registered in this repo

Defined in `src/integration/shadcn/widgets/index.ts`: `AltDateWidget`, `CheckboxWidget`, `CheckboxesWidget`, `RadioWidget`, `RangeWidget`, `SelectWidget`, `TextareaWidget`. Other types fall back to RJSF defaults where not overridden.

### npm scripts

| Script         | Purpose                     |
| -------------- | --------------------------- |
| `pnpm dev`     | Dev server, port 3000       |
| `pnpm build`   | Production build            |
| `pnpm preview` | Preview production build    |
| `pnpm test`    | Vitest (`vitest run`, once) |
| `pnpm lint`    | ESLint                      |
| `pnpm format`  | Prettier write + ESLint fix |
| `pnpm check`   | Prettier check only         |

### TypeScript paths

`@/*` maps to `./src/*` (`tsconfig.json`).

---

## Explanation

### Why JSON Schema first

The project’s stated direction is a **form builder** where **JSON Schema** defines structure and validation rules. `uiSchema` and the Shadcn theme then control labels, widget selection, layout hints, and styling without changing the canonical validation model. That separation keeps a single source of truth for “what the data is” versus “how it is shown.”

### Why TanStack Start / Router

TanStack Start and Router provide **routing and app shell** for the React UI. The workspace rules treat them as hosting for the experiment, not as a mandate to add APIs, auth, or server middleware unless the scope explicitly expands.

### How the theme fits RJSF

RJSF resolves a **theme** object (fields, templates, widgets). This repo builds that object in `theme.tsx` so experiments can fork `generateTheme`, `generateTemplates`, or individual widgets without forking all of `@rjsf/shadcn` upstream — the integration is local and editable.

### Object branches and nested fields

`ObjectField` and related templates can use small React contexts under `src/integration/shadcn/context/` so deeply nested properties (for example branches under `oneOf`) still receive consistent **`onChange` / `onBlur` / `onFocus`** and path identity when the stock layout would otherwise make that awkward. You normally do not import these contexts from experiments; they exist so the themed `ObjectField` and widgets behave correctly for complex schemas.

### Validation

The example routes use `@rjsf/validator-ajv8` with a customized AJV class (`Ajv2020`) so schemas can use modern JSON Schema features where needed. Validation behavior is therefore tied to AJV and the schema’s `$schema` / keywords, not to ad hoc React state.

---

## Related reading

- [React JSON Schema Form](https://rjsf-team.github.io/react-jsonschema-form/)
- [TanStack Router](https://tanstack.com/router)
- [Diátaxis](https://diataxis.fr/) — documentation framework used to structure this guide
