import type { EnumOptionsType, StrictRJSFSchema } from '@rjsf/utils';

/** Stable empty map when no nested branch applies — avoids new `Map()` every render (stable `useCallback` deps). */
export const EMPTY_PRIMARY_NEST_OWNER_MAP = new Map<string, unknown>();

/** Shared no-op for nested `SchemaField` props object fields do not use in this layout. */
export const nestSchemaFieldNoop = (): void => {};

/** When multiple options claim the same nested property, the earliest selected option in enum order owns it. */
export function primaryNestedFieldOwners(
  nestedByOption: Record<string, string[]>,
  enumOptions: EnumOptionsType<StrictRJSFSchema>[],
  selected: unknown[]
): Map<string, unknown> {
  const selectedSet = new Set(selected);
  const primary = new Map<string, unknown>();
  const enumOrder = enumOptions.map((o) => o.value);
  const fieldToClaimants = new Map<string, unknown[]>();
  for (const [opt, fields] of Object.entries(nestedByOption)) {
    for (const f of fields) {
      const list = fieldToClaimants.get(f) ?? [];
      list.push(opt);
      fieldToClaimants.set(f, list);
    }
  }
  for (const [field, claimants] of fieldToClaimants) {
    for (const opt of enumOrder) {
      if (claimants.includes(opt) && selectedSet.has(opt)) {
        primary.set(field, opt);
        break;
      }
    }
  }
  return primary;
}
