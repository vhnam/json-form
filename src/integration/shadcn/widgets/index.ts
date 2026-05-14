import type {
  FormContextType,
  RJSFSchema,
  RegistryWidgetsType,
  StrictRJSFSchema,
} from '@rjsf/utils';

import AltDateWidget from '@/integration/shadcn/widgets/AltDateWidget';
import CheckboxWidget from '@/integration/shadcn/widgets/CheckboxWidget';
import CheckboxesWidget from '@/integration/shadcn/widgets/CheckboxesWidget';
import RadioWidget from '@/integration/shadcn/widgets/RadioWidget';
import RangeWidget from '@/integration/shadcn/widgets/RangeWidget';
import SelectWidget from '@/integration/shadcn/widgets/SelectWidget';
import TextareaWidget from '@/integration/shadcn/widgets/TextareaWidget';

export function generateWidgets<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): RegistryWidgetsType<T, TSchema, TForm> {
  return {
    AltDateWidget,
    CheckboxWidget,
    CheckboxesWidget,
    RadioWidget,
    RangeWidget,
    SelectWidget,
    TextareaWidget,
  };
}

export default generateWidgets();
