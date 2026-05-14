import { SchemaExamples } from '@rjsf/core';
import { ariaDescribedByIds, examplesId, getInputProps } from '@rjsf/utils';
import type {
  BaseInputTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { useCallback } from 'react';
import type { ChangeEvent, FocusEvent, MouseEvent } from 'react';

import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';

/** The `BaseInputTemplate` is the template to use to render the basic `<input>` component for the `core` theme.
 * It is used as the template for rendering many of the <input> based widgets that differ by `type` and callbacks only.
 * It can be customized/overridden for other themes or individual implementations as needed.
 *
 * @param props - The `WidgetProps` for this template
 */
export default function BaseInputTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  id,
  htmlName,
  placeholder,
  required,
  readonly,
  disabled,
  type,
  value,
  onChange,
  onChangeOverride,
  onBlur,
  onFocus,
  autofocus,
  options,
  schema,
  rawErrors = [],
  children,
  extraProps,
  className,
  registry,
}: BaseInputTemplateProps<T, TSchema, TForm>) {
  const { ClearButton } = registry.templates.ButtonTemplates;
  const inputProps = {
    ...extraProps,
    ...getInputProps<T, TSchema, TForm>(schema, type, options),
  };
  const _onChange = ({ target: { value } }: ChangeEvent<HTMLInputElement>) =>
    onChange(value === '' ? options.emptyValue : value);
  const _onBlur = ({ target }: FocusEvent<HTMLInputElement>) =>
    onBlur(id, target.value);
  const _onFocus = ({ target }: FocusEvent<HTMLInputElement>) =>
    onFocus(id, target.value);
  const _onClear = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onChange(options.emptyValue ?? '');
    },
    [onChange, options.emptyValue]
  );

  return (
    <div className="p-0.5">
      <Input
        id={id}
        name={htmlName || id}
        type={type}
        placeholder={placeholder}
        autoFocus={autofocus}
        required={required}
        disabled={disabled}
        readOnly={readonly}
        className={cn(
          { 'border-destructive focus-visible:ring-0': rawErrors.length > 0 },
          className
        )}
        list={schema.examples ? examplesId(id) : undefined}
        {...inputProps}
        value={value || value === 0 ? value : ''}
        onChange={onChangeOverride || _onChange}
        onBlur={_onBlur}
        onFocus={_onFocus}
        aria-describedby={ariaDescribedByIds(id, !!schema.examples)}
      />
      {options.allowClearTextInputs &&
      !readonly &&
      !disabled &&
      value !== '' &&
      value !== undefined &&
      value !== null ? (
        <ClearButton onClick={_onClear} registry={registry} />
      ) : null}
      {children}
      <SchemaExamples id={id} schema={schema} />
    </div>
  );
}
