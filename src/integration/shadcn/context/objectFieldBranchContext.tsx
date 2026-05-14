import type {
  FieldPathId,
  FieldProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export type ObjectFieldBranchContextValue<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
> = {
  /** ObjectField passes this to child SchemaFields (same as core `childFieldPathId`). */
  fieldPathId: FieldPathId;
  onChange: FieldProps<T, TSchema, TForm>['onChange'];
  onBlur: FieldProps<T, TSchema, TForm>['onBlur'];
  onFocus: FieldProps<T, TSchema, TForm>['onFocus'];
};

const ObjectFieldBranchContext = createContext<ObjectFieldBranchContextValue<
  any,
  RJSFSchema,
  any
> | null>(null);

export function ObjectFieldBranchProvider<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  value,
  children,
}: {
  value: ObjectFieldBranchContextValue<T, TSchema, TForm>;
  children: ReactNode;
}) {
  return (
    <ObjectFieldBranchContext.Provider
      value={value as ObjectFieldBranchContextValue<any, RJSFSchema, any>}
    >
      {children}
    </ObjectFieldBranchContext.Provider>
  );
}

export function useObjectFieldBranchContext<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>() {
  return useContext(ObjectFieldBranchContext) as ObjectFieldBranchContextValue<
    T,
    TSchema,
    TForm
  > | null;
}
