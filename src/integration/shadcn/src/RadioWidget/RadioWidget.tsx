import {
  ariaDescribedByIds,
  enumOptionSelectedValue,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  getOptionValueFormat,
  optionId,
} from '@rjsf/utils';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';

import { cn } from '@/lib/utils';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { resolveEnumOptions } from '../resolveEnumOptions';

/** The `RadioWidget` is a widget for rendering a radio group.
 *  It is typically used with a string property constrained with enum options.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function RadioWidget<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  id,
  options,
  value,
  required,
  disabled,
  readonly,
  autofocus = false,
  onChange,
  onBlur,
  onFocus,
  className,
  htmlName,
  schema,
  rawErrors = [],
}: WidgetProps<T, TSchema, TForm>) {
  const { enumOptions: optionsEnumOptions, enumDisabled, emptyValue } = options;
  const enumOptions = resolveEnumOptions<TSchema>(optionsEnumOptions, schema);
  const optionValueFormat = getOptionValueFormat(options);

  const inline = options.inline ? Boolean(options.inline) : false;

  const _onChange = (encoded: string) =>
    onChange(
      enumOptionValueDecoder<TSchema>(
        encoded,
        enumOptions,
        optionValueFormat,
        emptyValue
      )
    );

  const selectedEncoded = enumOptionSelectedValue<TSchema>(
    value,
    enumOptions,
    false,
    optionValueFormat,
    ''
  ) as string;

  const groupValue = selectedEncoded === '' ? undefined : selectedEncoded;

  const isDisabled = disabled || readonly;
  const isInvalid = rawErrors.length > 0;

  return (
    <div className="p-0.5">
      <RadioGroup
        id={id}
        name={htmlName ?? id}
        value={groupValue}
        required={required}
        disabled={isDisabled}
        onValueChange={(encoded) => {
          _onChange(encoded);
        }}
        aria-describedby={ariaDescribedByIds(id)}
        aria-invalid={isInvalid}
        className={cn(
          'flex w-full gap-2',
          inline ? 'flex-row flex-wrap' : 'flex-col',
          className
        )}
      >
        {Array.isArray(enumOptions) &&
          enumOptions.map((option, index) => {
            const optionDisabled =
              Array.isArray(enumDisabled) &&
              enumDisabled.includes(option.value);
            const encoded = enumOptionValueEncoder(
              option.value,
              index,
              optionValueFormat
            );
            const decodedForEvents = enumOptionValueDecoder<TSchema>(
              encoded,
              enumOptions,
              optionValueFormat,
              emptyValue
            );

            return (
              <div
                className="flex items-center gap-2"
                key={optionId(id, index)}
              >
                <RadioGroupItem
                  value={encoded}
                  id={optionId(id, index)}
                  disabled={isDisabled || optionDisabled}
                  autoFocus={autofocus && index === 0}
                  onBlur={() => onBlur(id, decodedForEvents)}
                  onFocus={() => onFocus(id, decodedForEvents)}
                />
                <Label className="leading-tight" htmlFor={optionId(id, index)}>
                  {option.label}
                </Label>
              </div>
            );
          })}
      </RadioGroup>
    </div>
  );
}
