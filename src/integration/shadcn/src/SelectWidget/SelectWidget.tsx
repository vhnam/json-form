import {
  ariaDescribedByIds,
  enumOptionSelectedValue,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  getOptionValueFormat,
} from '@rjsf/utils';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { resolveEnumOptions } from '../resolveEnumOptions';

/** The `SelectWidget` is a widget for rendering dropdowns.
 *  It is typically used with string properties constrained with enum options.
 *
 * @param props - The `WidgetProps` for this component
 */
export default function SelectWidget<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  id,
  options,
  required,
  disabled,
  readonly,
  value,
  multiple,
  autofocus,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  rawErrors = [],
  className,
  schema,
}: WidgetProps<T, TSchema, TForm>) {
  const {
    enumOptions: optionsEnumOptions,
    enumDisabled,
    emptyValue: optEmptyValue,
  } = options;
  const enumOptions = resolveEnumOptions<TSchema>(optionsEnumOptions, schema);
  const optionValueFormat = getOptionValueFormat(options);

  const _onFancyFocus = () => {
    onFocus(
      id,
      enumOptionValueDecoder<TSchema>(
        value,
        enumOptions,
        optionValueFormat,
        optEmptyValue
      )
    );
  };

  const _onFancyBlur = () => {
    onBlur(
      id,
      enumOptionValueDecoder<TSchema>(
        value,
        enumOptions,
        optionValueFormat,
        optEmptyValue
      )
    );
  };

  const items =
    (enumOptions as any)?.map(
      ({ value: optVal, label }: any, index: number) => ({
        value: multiple
          ? optVal
          : enumOptionValueEncoder(optVal, index, optionValueFormat),
        label,
        index,
        disabled: Array.isArray(enumDisabled) && enumDisabled.includes(optVal),
      })
    ) ?? [];

  /** Passed to `Select` so `SelectValue` shows the option label (see shadcn Base Select `items`). */
  const selectItems = items.map(
    (item: { value: unknown; label: ReactNode }) => ({
      value: item.value,
      label: item.label,
    })
  );

  const triggerClassName = cn('w-full', className);
  const isInvalid = rawErrors.length > 0;
  const isDisabled = disabled || readonly;

  if (multiple) {
    const multipleValue = Array.isArray(value) ? value : [];

    return (
      <div className="p-0.5">
        <Select
          multiple
          items={selectItems}
          id={id}
          value={multipleValue}
          onValueChange={(newValues) => {
            onChange(
              enumOptionValueDecoder<TSchema>(
                newValues.map(String),
                enumOptions,
                optionValueFormat,
                optEmptyValue
              )
            );
          }}
          disabled={isDisabled}
          required={required}
        >
          <SelectTrigger
            className={triggerClassName}
            autoFocus={autofocus}
            onFocus={_onFancyFocus}
            onBlur={_onFancyBlur}
            aria-invalid={isInvalid}
            aria-describedby={ariaDescribedByIds(id)}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {items.map(
                (item: {
                  value: unknown;
                  label: ReactNode;
                  index: number;
                  disabled: boolean;
                }) => (
                  <SelectItem
                    key={item.index}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </SelectItem>
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  const selectedStr = enumOptionSelectedValue<TSchema>(
    value,
    enumOptions,
    false,
    optionValueFormat,
    ''
  ) as string;

  const singleValue = selectedStr === '' ? null : selectedStr;

  return (
    <div className="p-0.5">
      <Select
        items={selectItems}
        id={id}
        value={singleValue}
        onValueChange={(selectedValue) => {
          onChange(
            enumOptionValueDecoder<TSchema>(
              selectedValue ?? '',
              enumOptions,
              optionValueFormat,
              optEmptyValue
            )
          );
        }}
        disabled={isDisabled}
        required={required}
      >
        <SelectTrigger
          className={triggerClassName}
          autoFocus={autofocus}
          onFocus={_onFancyFocus}
          onBlur={_onFancyBlur}
          aria-invalid={isInvalid}
          aria-describedby={ariaDescribedByIds(id)}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map(
              (item: {
                value: string;
                label: ReactNode;
                index: number;
                disabled: boolean;
              }) => (
                <SelectItem
                  key={item.index}
                  value={String(item.value)}
                  disabled={item.disabled}
                >
                  {item.label}
                </SelectItem>
              )
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
