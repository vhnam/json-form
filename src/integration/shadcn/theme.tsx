import type { ThemeProps } from '@rjsf/core';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import ObjectField from '@/integration/shadcn/fields/ObjectField';
import { generateTemplates } from '@/integration/shadcn/templates';
import { generateWidgets } from '@/integration/shadcn/widgets';

export function generateTheme<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): ThemeProps<T, TSchema, TForm> {
  return {
    fields: {
      ObjectField,
    },
    templates: generateTemplates<T, TSchema, TForm>(),
    widgets: generateWidgets<T, TSchema, TForm>(),
  };
}

export default generateTheme();
