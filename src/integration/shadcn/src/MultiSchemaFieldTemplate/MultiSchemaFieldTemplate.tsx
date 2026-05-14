import type {
  FormContextType,
  MultiSchemaFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { cn } from '@/lib/utils';

export default function MultiSchemaFieldTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  selector,
  optionSchemaField,
}: MultiSchemaFieldTemplateProps<T, TSchema, TForm>) {
  return (
    <div className={cn('rounded-md border bg-background p-4 shadow-sm')}>
      <div className={cn('mb-4')}>{selector}</div>
      {optionSchemaField}
    </div>
  );
}
