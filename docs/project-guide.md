# json-form — project guide

This guide follows the [Diátaxis](https://diataxis.fr/) structure: **tutorial** (learn by doing), **how-to** (solve a task), **reference** (facts), **explanation** (concepts). It reflects the repository as of the last review.

Deep dive on `json.schema.json`, `ui.schema.json`, and `validation.schema.ts`: [form-assets.md](form-assets.md).

**Audience:** developers working on this repo or cloning it to experiment with JSON Schema forms.

**Scope:** frontend form experiments with RJSF, local Shadcn integration, Zod-backed validation, TanStack Router routes, and assets under `src/assets`. Out of scope unless explicitly requested: backends, auth, server functions, persistence.

---

## Tutorial: run the app and open an example form

Goal: confirm the workspace runs and see a real schema-driven form with layered validation.

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Start the dev server (port **3000**):

   ```bash
   pnpm dev
   ```

3. In the browser, open one of the bundled examples. Each lazy route loads JSON from `src/assets/…`, wires a Zod schema from `validation.schema.ts`, and renders the shared `Form` component:

   | URL                     | Title                | Assets folder           | Useful to see                                                |
   | ----------------------- | -------------------- | ----------------------- | ------------------------------------------------------------ |
   | `/internal-triage-form` | Internal Triage Form | `internal-triage-form/` | A fuller triage-style schema and cross-field Zod rules       |
   | `/payment-methods`      | Payment Methods      | `payment-methods/`      | Arrays, `options` id/label, `oneOf`, conditional Zod refine  |

4. Fill required fields and submit. Until required data is complete, the submit button stays disabled and field errors stay hidden (default **`submitThenChange`** validation mode). After a submit attempt—or once the form is complete and live validation kicks in—errors appear on invalid fields.

5. Submit the form. The route’s `onSubmit` handler logs `formData` to the console (no network call).

You have now exercised the main research loop: **JSON Schema + uiSchema + themed `Form` + AJV (structural) + Zod (rules and messages)**.

---

## How-to guides

### Add a new experimental form route

1. Add assets under `src/assets/<your-experiment>/` (one folder per experiment keeps bundles together):
   - `json.schema.json` — structure, types, and JSON Schema keywords for RJSF/AJV.
   - `ui.schema.json` (optional) — widget and layout hints.
   - `validation.schema.ts` — Zod schema, exported type, and cross-field rules (see below).

2. Create a lazy route under `src/routes/`, e.g. `my-form.lazy.tsx`, using `createLazyFileRoute('/my-form')` so the URL is `/my-form`.

3. Import `Form` from `@/integration/shadcn/form` (or `@/integration/shadcn` — same default export, which is `JsonSchemaForm`).

4. Import JSON as modules and cast `schema` to `RJSFSchema` when TypeScript needs it (same pattern as `payment-methods.lazy.tsx`).

5. Build validators once at module scope:

   ```ts
   import { createZodFormValidators } from '@/integration/zod/createZodCustomValidate';
   import { myFormZodSchema, type MyFormData } from '@/assets/my-experiment/validation.schema';

   const customValidate = createZodFormValidators<MyFormData>(myFormZodSchema);
   ```

6. Pass `customValidate` (the full object from `createZodFormValidators`, not only `.customValidate`) and `onSubmit` to `Form`:

   ```tsx
   <Form
     schema={schema as unknown as RJSFSchema}
     uiSchema={uiSchema}
     customValidate={customValidate}
     onSubmit={handleSubmit}
   />
   ```

`JsonSchemaForm` wires AJV (`@rjsf/validator-ajv8` with `Ajv2020`) and forwards `customValidate.customValidate` and `customValidate.isFormValid` into `ThemedForm`. You do not configure the validator in the route.

### Add cross-field or conditional validation with Zod

Keep JSON Schema focused on shape and widgets; put rules that depend on multiple fields or business logic in `validation.schema.ts`:

1. Define a `z.object({ … })` that matches the form’s `formData` shape (names must align with JSON Schema property keys so RJSF can map errors to fields).

2. Use `.superRefine()` (or `.refine()`) for conditional requirements—for example, “if payment method includes corporate benefit, require `byCorporateBenefit`.” See `src/assets/payment-methods/validation.schema.ts`.

3. Export `z.infer<typeof …>` as the form data type for typed `onSubmit` handlers.

4. Pass the schema to `createZodFormValidators`. Zod issues are mapped onto RJSF field paths via `applyZodIssuesToFormValidation` in `src/integration/zod/`.

Options on `createZodFormValidators` (second argument): `preferZodMessages` (default `true`), `replaceSchemaErrors` (default `true`, clears AJV messages when Zod runs so users see one message per field).

### Change how fields look

Presentation is layered on top of the schema:

- **Widgets** — control widgets for types like select, checkbox, radio, textarea, range, alt date: `src/integration/shadcn/widgets/`.

- **Templates** — layout and chrome (field rows, errors, array add/remove, submit): `src/integration/shadcn/templates/`.

- **Fields** — higher-level field components (e.g. `ArrayField`, `ObjectField`): `src/integration/shadcn/fields/`.

Register or swap implementations through `generateTheme()` in `src/integration/shadcn/theme.tsx`, which combines `generateFields`, `generateTemplates`, and `generateWidgets`.

Templates and some widgets read **`FormValidationContext`** (`showFieldErrors`, `disableSubmit`, `markSubmitAttempted`) so error chrome and submit state match the validation mode.

### Id/label `options` and enum-backed widgets

Some experiments use a non-standard **`options: [{ id, label, description? }]`** shape (see `payment-methods/json.schema.json`) instead of only `enum` / `enumNames`. Select, radio, and checkboxes widgets resolve labels through **`resolveEnumOptions`** in `src/integration/shadcn/resolveEnumOptions.ts`, which also understands `enum`, `enumNames`, and `oneOf` const branches.

For **`type: "array"`** fields (e.g. multi-select checkboxes), RJSF often passes the **array** schema; enum metadata frequently lives on **`items`**. The resolver unwraps a single-object `items` schema so widgets still receive the right options.

### Use a different validation UX mode

`Form` accepts `validationMode` (via `JsonSchemaFormProps`):

| Mode               | Behavior |
| ------------------ | -------- |
| `submitThenChange` | Default. No field errors until submit is attempted; submit disabled until `isFormValid` passes; then live validation on change. |
| `onChange`         | Errors and submit state follow `liveValidate` / `isFormValid` immediately. |

`disableSubmitWhenInvalid` defaults to `true`. For advanced flows, use `ThemedForm` from `@/integration/shadcn/form` directly instead of `JsonSchemaForm`.

### Add a Shadcn UI primitive

Use the project’s documented pattern:

```bash
pnpm dlx shadcn@latest add <component>
```

Primitives live under `src/components/ui` and are composed by the integration layer.

---

## Reference

### Repository layout (high signal)

| Path                                              | Role                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/routes/`                                     | TanStack Router file-based routes; lazy routes for heavier pages                                        |
| `src/integration/shadcn/`                         | RJSF theme: `JsonSchemaForm`, `themedForm.tsx`, `theme.tsx`, `fields/`, `templates/`, `widgets/`      |
| `src/integration/shadcn/resolveEnumOptions.ts`    | Shared enum / `options` / `oneOf` resolution for select, radio, and checkboxes widgets                  |
| `src/integration/shadcn/formValidationContext.tsx`| React context for submit/error visibility used by templates and widgets                                   |
| `src/integration/shadcn/context/`                 | React contexts for nested fields (e.g. checkbox nesting, object-field branches)                         |
| `src/integration/zod/`                            | `createZodFormValidators`, `applyZodIssuesToFormValidation` — bridge Zod issues to RJSF errors            |
| `src/components/ui/`                              | Shadcn-style UI primitives                                                                              |
| `src/assets/<experiment>/`                        | `json.schema.json`, `ui.schema.json`, `validation.schema.ts` per experiment                             |
| `vite.config.ts`                                  | Vite + TanStack Start plugin, Tailwind v4, React Compiler (Babel), manual chunks for RJSF/AJV/date libs |

### Public integration API

From `src/integration/shadcn/index.ts` and `form.ts`:

| Export            | Description |
| ----------------- | ----------- |
| `Form` (default)  | `JsonSchemaForm` — AJV validator + `ThemedForm` with Zod `customValidate` / `isFormValid` |
| `JsonSchemaFormProps` | Props: `schema`, `uiSchema`, `onSubmit`, `customValidate`, optional `validationMode`, `disableSubmitWhenInvalid`, `formData` / `initialFormData` |
| `ThemedForm`, `generateForm` | Lower-level themed RJSF form with validation-mode wrapper |
| `FormValidationMode` | `'submitThenChange' \| 'onChange'` |
| `Templates`, `generateTemplates` | Template registry |
| `Theme`, `generateTheme` | Full theme object |
| `Widgets`, `generateWidgets` | Widget registry |

`generateForm()` returns a component that wraps `withTheme(generateTheme())` and adds validation-mode behavior.

Zod helpers (import from `@/integration/zod/createZodCustomValidate`):

| Function                   | Role |
| -------------------------- | ---- |
| `createZodFormValidators`  | Returns `{ customValidate, isFormValid }` with a shared parse cache per `formData` reference |
| `createZodCustomValidate`  | Returns only `customValidate` (legacy-style) |
| `createZodIsFormValid`     | Deprecated; use `createZodFormValidators` |

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

The project’s stated direction is a **form builder** where **JSON Schema** defines structure and validation rules. `uiSchema` and the Shadcn theme then control labels, widget selection, layout hints, and styling without changing the canonical data model. That separation keeps a single source of truth for “what the data is” versus “how it is shown.”

### Why TanStack Start / Router

TanStack Start and Router provide **routing and app shell** for the React UI. The workspace rules treat them as hosting for the experiment, not as a mandate to add APIs, auth, or server middleware unless the scope explicitly expands.

### How the theme fits RJSF

RJSF resolves a **theme** object (fields, templates, widgets). This repo builds that object in `theme.tsx` so experiments can fork `generateTheme`, `generateTemplates`, or individual widgets without forking all of `@rjsf/shadcn` upstream — the integration is local and editable.

### Object branches and nested fields

`ObjectField` and related templates can use small React contexts under `src/integration/shadcn/context/` so deeply nested properties (for example branches under `oneOf`) still receive consistent **`onChange` / `onBlur` / `onFocus`** and path identity when the stock layout would otherwise make that awkward. You normally do not import these contexts from experiments; they exist so the themed `ObjectField` and widgets behave correctly for complex schemas.

### Validation: AJV and Zod together

Validation runs in two layers:

1. **AJV** (`@rjsf/validator-ajv8`, `Ajv2020`) — JSON Schema keywords from `json.schema.json` (types, `required`, `minLength`, etc.). Configured once inside `JsonSchemaForm`.

2. **Zod** — `customValidate` from `createZodFormValidators`, typically backed by `validation.schema.ts`. Handles cross-field rules, clearer messages, and logic that is awkward in pure JSON Schema. On each validation pass, Zod issues are written into RJSF’s `FormValidation` / `ErrorSchema` trees; by default AJV field errors at the same paths are cleared so Zod messages win.

`isFormValid` uses the same cached `safeParse` as `customValidate`, so submit enablement and error display stay consistent without double parsing the same snapshot.

### `submitThenChange` validation UX

Default `ThemedForm` behavior is tuned for long forms:

1. **Before completeness** — `liveValidate` is off; no inline errors; submit stays disabled until Zod reports the form satisfies required rules (`isFormValid`).

2. **When complete** — `liveValidationEnabled` turns on; changes re-run validation.

3. **After submit attempt** — field errors show even if the user has not yet fixed everything; submit can still be gated on zero errors when live validation is active.

Widgets and templates consult `FormValidationContext.showFieldErrors` (and related form-context keys) so controls match this timeline. `SubmitButton` respects `disableSubmit` from the same context.

For simpler demos or builder previews, set `validationMode="onChange"` on `Form`.

### Form asset files (`json.schema.json`, `ui.schema.json`, `validation.schema.ts`)

Each experiment folder under `src/assets/` holds the schema contract, presentation hints, and Zod rules. How to author them and how they connect at runtime is documented in **[form-assets.md](form-assets.md)** (explanation). The project guide keeps tutorial, how-to, and reference material here.

---

## Related reading

- [form-assets.md](form-assets.md) — writing and understanding the three asset files per experiment
- [React JSON Schema Form](https://rjsf-team.github.io/react-jsonschema-form/)
- [Zod](https://zod.dev/)
- [TanStack Router](https://tanstack.com/router)
- [Diátaxis](https://diataxis.fr/) — documentation framework used to structure this guide
