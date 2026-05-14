import type {
  FormContextType,
  RJSFSchema,
  RegistryFieldsType,
  StrictRJSFSchema,
} from '@rjsf/utils';

import ArrayField from './ArrayField';
import ObjectField from './ObjectField';

export function generateFields<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): RegistryFieldsType<T, TSchema, TForm> {
  return {
    ArrayField: ArrayField as never,
    ObjectField,
  };
}

export default generateFields();
