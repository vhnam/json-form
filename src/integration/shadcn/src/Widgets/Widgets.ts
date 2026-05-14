import type {
  FormContextType,
  RegistryWidgetsType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'
import AltDateWidget from '../AltDateWidget'
import CheckboxWidget from '../CheckboxWidget'
import CheckboxesWidget from '../CheckboxesWidget'
import RadioWidget from '../RadioWidget'
import RangeWidget from '../RangeWidget'
import SelectWidget from '../SelectWidget'
import TextareaWidget from '../TextareaWidget'

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
  }
}

export default generateWidgets()
