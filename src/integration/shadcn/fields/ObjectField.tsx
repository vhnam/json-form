import { getDefaultRegistry } from '@rjsf/core';
import type { FieldProps, FormContextType, RJSFSchema, StrictRJSFSchema } from '@rjsf/utils';
import { useMemo } from 'react';

import { ObjectFieldBranchProvider } from '@/integration/shadcn/context/objectFieldBranchContext';

const BaseObjectField = getDefaultRegistry().fields.ObjectField;

/** Wraps the core ObjectField so descendants can access the object-level `onChange` and path id (for nested layouts). */
export default function ObjectField<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: FieldProps<T, TSchema, TForm>) {
  const childFieldPathId = props.childFieldPathId ?? props.fieldPathId;
  const branchValue = useMemo(
    () => ({
      onChange: props.onChange,
      onBlur: props.onBlur,
      onFocus: props.onFocus,
      fieldPathId: childFieldPathId,
    }),
    [props.onChange, props.onBlur, props.onFocus, childFieldPathId]
  );
  return (
    <ObjectFieldBranchProvider value={branchValue}>
      <BaseObjectField
        {...(props as unknown as FieldProps<any, RJSFSchema, any>)}
      />
    </ObjectFieldBranchProvider>
  );
}
