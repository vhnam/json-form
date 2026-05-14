import type { EnumOptionsType, StrictRJSFSchema } from '@rjsf/utils';

/** For `type: "array"` fields, RJSF often passes the **array** schema; `enum`, `enumNames`, `oneOf`, and `options` for
 *  multi-select / checkboxes usually live on **`items`**. Tuple `items: [ ... ]` is left unchanged (no single leaf). */
function schemaForEnumResolution<TSchema extends StrictRJSFSchema>(
  schema: TSchema
): TSchema {
  const st = (schema as { type?: unknown }).type;
  const items = (schema as { items?: unknown }).items;
  if (
    st === 'array' &&
    items &&
    typeof items === 'object' &&
    !Array.isArray(items)
  ) {
    return items as TSchema;
  }
  return schema;
}

/** Non-standard schema shape used by some forms: `options: [{ id, label }]` instead of `enum` / `oneOf`. */
export function enumOptionsFromSchemaIdLabelOptions<
  TSchema extends StrictRJSFSchema,
>(schema: TSchema): EnumOptionsType<TSchema>[] | undefined {
  const raw = (schema as { options?: unknown }).options;
  if (!Array.isArray(raw) || raw.length === 0) {
    return undefined;
  }
  const mapped: EnumOptionsType<TSchema>[] = [];
  for (const entry of raw) {
    if (
      !entry ||
      typeof entry !== 'object' ||
      !('id' in entry) ||
      !('label' in entry)
    ) {
      return undefined;
    }
    const { id, label } = entry as { id: unknown; label: unknown };
    const desc = (entry as { description?: unknown }).description;
    mapped.push({
      value: id,
      label: String(label),
      ...(typeof desc === 'string' && desc.trim().length > 0
        ? { description: desc.trim() }
        : {}),
    });
  }
  return mapped;
}

/** Overlay labels from JSON Schema `enumNames` (same indices as `enum`) or build options when only the schema defines them. */
function applyEnumNamesFromSchema<TSchema extends StrictRJSFSchema>(
  enumOptions: EnumOptionsType<TSchema>[] | undefined,
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  const values = (schema as { enum?: unknown }).enum;
  const names = (schema as { enumNames?: unknown }).enumNames;
  if (!Array.isArray(values) || values.length === 0) {
    return enumOptions;
  }
  const valueList = values as unknown[];
  const nameList = Array.isArray(names) ? (names as unknown[]) : [];
  const labelByValue = new Map<string, string>();
  for (let i = 0; i < valueList.length; i++) {
    const n = nameList[i];
    if (typeof n === 'string') {
      labelByValue.set(String(valueList[i]), n);
    }
  }
  if (labelByValue.size === 0) {
    return enumOptions;
  }
  if (Array.isArray(enumOptions) && enumOptions.length > 0) {
    return enumOptions.map((opt) => {
      const custom = labelByValue.get(String(opt.value));
      return custom !== undefined ? { ...opt, label: custom } : opt;
    });
  }
  return valueList.map((val) => ({
    value: val,
    label: labelByValue.get(String(val)) ?? String(val),
  }));
}

/** Build enum options from `oneOf` branches that use `const` (and optional `title` for display). */
function enumOptionsFromOneOfSchema<TSchema extends StrictRJSFSchema>(
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  const oneOf = (schema as { oneOf?: unknown }).oneOf;
  if (!Array.isArray(oneOf)) {
    return undefined;
  }
  const out: EnumOptionsType<TSchema>[] = [];
  for (const branch of oneOf) {
    if (!branch || typeof branch !== 'object' || !('const' in branch)) {
      continue;
    }
    const b = branch as {
      const: unknown;
      title?: unknown;
      description?: unknown;
    };
    const title = b.title;
    const label =
      typeof title === 'string' && title.length > 0 ? title : String(b.const);
    const desc = b.description;
    out.push({
      value: b.const,
      label,
      ...(typeof desc === 'string' && desc.trim().length > 0
        ? { description: desc.trim() }
        : {}),
    });
  }
  return out.length > 0 ? out : undefined;
}

/** Prefer `oneOf` branch `title` as the visible label when RJSF only supplies raw `const` values. */
function mergeOneOfTitles<TSchema extends StrictRJSFSchema>(
  enumOptions: EnumOptionsType<TSchema>[] | undefined,
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  const fromOneOf = enumOptionsFromOneOfSchema(schema);
  if (!fromOneOf || fromOneOf.length === 0) {
    return enumOptions;
  }
  const titleByValue = new Map(
    fromOneOf.map((o) => [String(o.value), o.label] as const)
  );
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) {
    return fromOneOf;
  }
  return enumOptions.map((opt) => {
    const t = titleByValue.get(String(opt.value));
    const fo = fromOneOf.find((o) => String(o.value) === String(opt.value));
    const rawDesc =
      fo &&
      typeof (fo as unknown as { description?: unknown }).description ===
        'string'
        ? String((fo as unknown as { description: string }).description)
        : undefined;
    const foDesc =
      typeof rawDesc === 'string' && rawDesc.trim().length > 0
        ? rawDesc.trim()
        : undefined;
    let next: EnumOptionsType<TSchema> = opt;
    if (t !== undefined) {
      next = { ...next, label: t };
    }
    if (
      foDesc !== undefined &&
      (next as unknown as { description?: string }).description === undefined
    ) {
      next = { ...next, description: foDesc } as EnumOptionsType<TSchema>;
    }
    return next;
  });
}

/** When a schema pairs `oneOf` / `enum` with a custom `options: [{ id, label }]` list, RJSF only reads `oneOf` and
 *  labels fall back to const strings. Overlay labels from `options` where `id` matches the enum value. */
function applySchemaOptionsLabels<TSchema extends StrictRJSFSchema>(
  enumOptions: EnumOptionsType<TSchema>[] | undefined,
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  if (!Array.isArray(enumOptions) || enumOptions.length === 0) {
    return enumOptions;
  }
  const raw = (schema as { options?: unknown }).options;
  if (!Array.isArray(raw) || raw.length === 0) {
    return enumOptions;
  }
  const labelById = new Map<string, string>();
  const descriptionById = new Map<string, string>();
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === 'object' &&
      'id' in entry &&
      'label' in entry
    ) {
      const { id, label } = entry as { id: unknown; label: unknown };
      labelById.set(String(id), String(label));
      const desc = (entry as { description?: unknown }).description;
      if (typeof desc === 'string' && desc.trim().length > 0) {
        descriptionById.set(String(id), desc.trim());
      }
    }
  }
  if (labelById.size === 0 && descriptionById.size === 0) {
    return enumOptions;
  }
  return enumOptions.map((opt) => {
    const key = String(opt.value);
    const customLabel = labelById.get(key);
    const customDesc = descriptionById.get(key);
    if (customLabel === undefined && customDesc === undefined) {
      return opt;
    }
    return {
      ...opt,
      ...(customLabel !== undefined ? { label: customLabel } : {}),
      ...(customDesc !== undefined ? { description: customDesc } : {}),
    };
  });
}

export function resolveEnumOptions<TSchema extends StrictRJSFSchema>(
  fromWidgetOptions: EnumOptionsType<TSchema>[] | undefined,
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  const leaf = schemaForEnumResolution(schema);
  const withEnumNames = applyEnumNamesFromSchema(fromWidgetOptions, leaf);
  const withOneOf = mergeOneOfTitles(withEnumNames, leaf);
  const merged = applySchemaOptionsLabels(withOneOf, leaf);
  if (Array.isArray(merged) && merged.length > 0) {
    return merged;
  }
  return enumOptionsFromSchemaIdLabelOptions(leaf);
}
