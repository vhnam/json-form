import type { ThemeProps } from '@rjsf/core';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { generateTemplates } from '../Templates';
import { generateWidgets } from '../Widgets';

export function generateTheme<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): ThemeProps<T, TSchema, TForm> {
  return {
    templates: generateTemplates<T, TSchema, TForm>(),
    widgets: generateWidgets<T, TSchema, TForm>(),
  };
}

export default generateTheme();
