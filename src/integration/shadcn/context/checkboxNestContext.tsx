import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  ErrorSchema,
  Registry,
  RJSFSchema,
  UiSchema,
} from '@rjsf/utils';

/** Maps checkbox field name → option value → sibling property names to show under that row. */
export type CheckboxNestedFieldsMap = Record<string, Record<string, string[]>>;

export type CheckboxNestContextValue = {
  checkboxNestedFields: CheckboxNestedFieldsMap;
  nestedPropertyNames: ReadonlySet<string>;
  objectFormData: unknown;
  objectUiSchema: UiSchema;
  objectErrorSchema: ErrorSchema | undefined;
  objectSchema: RJSFSchema;
  registry: Registry;
  hideError?: boolean;
  disabled: boolean;
  readonly: boolean;
};

const CheckboxNestContext = createContext<CheckboxNestContextValue | null>(null);

export function CheckboxNestProvider({
  value,
  children,
}: {
  value: CheckboxNestContextValue;
  children: ReactNode;
}) {
  return (
    <CheckboxNestContext.Provider value={value}>{children}</CheckboxNestContext.Provider>
  );
}

export function useCheckboxNestContext() {
  return useContext(CheckboxNestContext);
}

export function collectNestedPropertyNames(
  map: CheckboxNestedFieldsMap | undefined
): Set<string> {
  const out = new Set<string>();
  if (!map) {
    return out;
  }
  for (const byOption of Object.values(map)) {
    for (const fields of Object.values(byOption)) {
      for (const f of fields) {
        out.add(f);
      }
    }
  }
  return out;
}
