import type { FormProps } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import type { ComponentType } from 'react';

import { generateTheme } from '../Theme';

export function generateForm<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): ComponentType<FormProps<T, TSchema, TForm>> {
  return withTheme<T, TSchema, TForm>(generateTheme<T, TSchema, TForm>());
}

export default generateForm();
