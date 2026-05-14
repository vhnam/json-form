import type { EnumOptionsType, StrictRJSFSchema } from '@rjsf/utils';

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
    mapped.push({
      value: id,
      label: String(label),
    });
  }
  return mapped;
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
  for (const entry of raw) {
    if (
      entry &&
      typeof entry === 'object' &&
      'id' in entry &&
      'label' in entry
    ) {
      const { id, label } = entry as { id: unknown; label: unknown };
      labelById.set(String(id), String(label));
    }
  }
  if (labelById.size === 0) {
    return enumOptions;
  }
  return enumOptions.map((opt) => {
    const custom = labelById.get(String(opt.value));
    return custom !== undefined ? { ...opt, label: custom } : opt;
  });
}

export function resolveEnumOptions<TSchema extends StrictRJSFSchema>(
  fromWidgetOptions: EnumOptionsType<TSchema>[] | undefined,
  schema: TSchema
): EnumOptionsType<TSchema>[] | undefined {
  const withLabels = applySchemaOptionsLabels(fromWidgetOptions, schema);
  if (Array.isArray(withLabels) && withLabels.length > 0) {
    return withLabels;
  }
  return enumOptionsFromSchemaIdLabelOptions(schema);
}
