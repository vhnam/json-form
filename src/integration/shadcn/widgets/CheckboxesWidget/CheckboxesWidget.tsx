import {
  ariaDescribedByIds,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
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

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/** The `CheckboxesWidget` is a widget for rendering checkbox groups.
 *  It is typically used to represent an array of enums.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function CheckboxesWidget<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  id,
  htmlName,
  disabled,
  options,
  value,
  autofocus,
  readonly,
  required,
  onChange,
  onBlur,
  onFocus,
  className,
}: WidgetProps<T, TSchema, TForm>) {
  const { enumOptions, enumDisabled, inline, emptyValue } = options;
  const optionValueFormat = getOptionValueFormat(options);
  const checkboxesValues = Array.isArray(value) ? value : [value];

  return (
    <div
      className={cn(
        {
          'flex flex-col gap-2': !inline,
          'flex flex-row flex-wrap gap-4': inline,
        },
        className
      )}
    >
      {Array.isArray(enumOptions) &&
        enumOptions.map((option, index: number) => {
          const checked = enumOptionsIsSelected<TSchema>(
            option.value,
            checkboxesValues
          );
          const itemDisabled =
            Array.isArray(enumDisabled) &&
            enumDisabled.indexOf(option.value) !== -1;
          const indexOptionId = optionId(id, index);
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
            <div className="flex items-center gap-2" key={indexOptionId}>
              <Checkbox
                id={indexOptionId}
                name={htmlName || id}
                value={encoded}
                required={required}
                disabled={disabled || itemDisabled || readonly}
                onCheckedChange={(state) => {
                  if (state) {
                    onChange(
                      enumOptionsSelectValue<TSchema>(
                        index,
                        checkboxesValues,
                        enumOptions
                      )
                    );
                  } else {
                    onChange(
                      enumOptionsDeselectValue<TSchema>(
                        index,
                        checkboxesValues,
                        enumOptions
                      )
                    );
                  }
                }}
                checked={checked}
                autoFocus={autofocus && index === 0}
                onBlur={() => onBlur(id, decodedForEvents)}
                onFocus={() => onFocus(id, decodedForEvents)}
                aria-describedby={ariaDescribedByIds(id)}
              />
              <Label className="leading-tight" htmlFor={optionId(id, index)}>
                {option.label}
              </Label>
            </div>
          );
        })}
    </div>
  );
}
