import { descriptionId, getTemplate, getUiOptions } from '@rjsf/utils';
import type {
  FieldTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';

/** The `FieldTemplate` component is the template used by `SchemaField` to render any field. It renders the field
 * content, (label, description, children, errors and help) inside a `WrapIfAdditional` component.
 *
 * @param props - The `FieldTemplateProps` for this component
 */
export default function FieldTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  id,
  children,
  displayLabel,
  rawErrors = [],
  errors,
  help,
  description,
  rawDescription,
  classNames,
  style,
  disabled,
  label,
  hidden,
  onKeyRename,
  onKeyRenameBlur,
  onRemoveProperty,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: FieldTemplateProps<T, TSchema, TForm>) {
  const uiOptions = getUiOptions(uiSchema);
  const WrapIfAdditionalTemplate = getTemplate<
    'WrapIfAdditionalTemplate',
    T,
    TSchema,
    TForm
  >('WrapIfAdditionalTemplate', registry, uiOptions);
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    TSchema,
    TForm
  >('DescriptionFieldTemplate', registry, uiOptions);
  if (hidden) {
    return <div className="hidden">{children}</div>;
  }
  const isCheckbox = uiOptions.widget === 'checkbox';
  const isCheckboxes = uiOptions.widget === 'checkboxes';
  return (
    <WrapIfAdditionalTemplate
      classNames={classNames}
      style={style}
      disabled={disabled}
      id={id}
      label={label}
      displayLabel={displayLabel}
      onKeyRename={onKeyRename}
      onKeyRenameBlur={onKeyRenameBlur}
      onRemoveProperty={onRemoveProperty}
      rawDescription={rawDescription}
      readonly={readonly}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
    >
      <div className="flex flex-col gap-2">
        {displayLabel && !isCheckbox && (
          <Label
            htmlFor={id}
            className={cn(
              'text-sm leading-none font-semibold peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              { 'text-destructive': rawErrors.length > 0 }
            )}
          >
            {label}
          </Label>
        )}
        {displayLabel && rawDescription && isCheckboxes && (
          <DescriptionFieldTemplate
            id={descriptionId(id)}
            description={rawDescription}
            schema={schema}
            uiSchema={uiSchema}
            registry={registry}
          />
        )}
        {children}
        {displayLabel && rawDescription && !isCheckbox && !isCheckboxes && (
          <span
            className={cn('text-xs font-medium text-muted-foreground', {
              'text-destructive': rawErrors.length > 0,
            })}
          >
            {description}
          </span>
        )}
        {errors}
        {help}
      </div>
    </WrapIfAdditionalTemplate>
  );
}
