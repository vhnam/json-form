import {
  ariaDescribedByIds,
  enumOptionValueDecoder,
  enumOptionValueEncoder,
  enumOptionsDeselectValue,
  enumOptionsIsSelected,
  enumOptionsSelectValue,
  getOptionValueFormat,
  optionId,
  toFieldPathId,
} from '@rjsf/utils';
import type {
  ErrorSchema,
  FieldProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils';
import { useCallback, useMemo } from 'react';

import { cn } from '@/lib/utils';

import { useCheckboxNestContext } from '@/integration/shadcn/context/checkboxNestContext';
import { useObjectFieldBranchContext } from '@/integration/shadcn/context/objectFieldBranchContext';
import {
  EMPTY_PRIMARY_NEST_OWNER_MAP,
  nestSchemaFieldNoop,
  primaryNestedFieldOwners,
} from '@/integration/shadcn/widgets/primaryNestedFieldOwners';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

/** The `CheckboxesWidget` is a widget for rendering checkbox groups.
 *  It is typically used to represent an array of enums.
 *
 *  When rendered inside an object that sets `ui:options.checkboxNestedFields`, sibling fields listed for each
 *  option render indented under that option (see internal triage form).
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
  name,
  registry,
}: WidgetProps<T, TSchema, TForm>) {
  const nest = useCheckboxNestContext();
  const branch = useObjectFieldBranchContext<T, TSchema, TForm>();
  const nestedByOption =
    nest !== null ? nest.checkboxNestedFields[name] : undefined;

  const { enumOptions, enumDisabled, inline, emptyValue } = options;
  const optionValueFormat = getOptionValueFormat(options);
  const checkboxesValues = useMemo(
    () => (Array.isArray(value) ? value : [value]),
    [value]
  );

  const primaryNestedOwner = useMemo(
    () =>
      nestedByOption && Array.isArray(enumOptions)
        ? primaryNestedFieldOwners(
            nestedByOption,
            enumOptions,
            checkboxesValues
          )
        : EMPTY_PRIMARY_NEST_OWNER_MAP,
    [nestedByOption, enumOptions, checkboxesValues]
  );

  const { fields, schemaUtils, globalFormOptions } = registry;
  const { SchemaField } = fields;

  const renderNestedFields = useCallback(
    (optionValue: unknown) => {
      if (!nest || !branch || !nestedByOption) {
        return null;
      }
      const fieldNames = (nestedByOption as Partial<Record<string, string[]>>)[
        String(optionValue)
      ];
      if (fieldNames === undefined || fieldNames.length === 0) {
        return null;
      }
      const propsSchema = nest.objectSchema.properties as
        | Record<string, TSchema | undefined>
        | undefined;
      if (!propsSchema) {
        return null;
      }
      return fieldNames.map((fieldName) => {
        if (primaryNestedOwner.get(fieldName) !== optionValue) {
          return null;
        }
        const rawProp = propsSchema[fieldName];
        if (rawProp === undefined) {
          return null;
        }
        const childSchema = schemaUtils.retrieveSchema(
          rawProp,
          nest.objectFormData as T
        );
        const fieldUiSchema = nest.objectUiSchema[fieldName];
        const errRec = nest.objectErrorSchema as
          | Record<string, ErrorSchema>
          | undefined;
        const fieldErrorSchema = errRec?.[fieldName];
        const innerFieldPathId = toFieldPathId(
          fieldName,
          globalFormOptions,
          branch.fieldPathId.path
        );
        const isRequired =
          Array.isArray(nest.objectSchema.required) &&
          nest.objectSchema.required.includes(fieldName);
        const fd = nest.objectFormData as Record<string, unknown> | undefined;
        const nestFieldProps: FieldProps<any, RJSFSchema, any> = {
          name: fieldName,
          required: isRequired,
          schema: childSchema,
          uiSchema: fieldUiSchema,
          errorSchema: fieldErrorSchema,
          fieldPathId: innerFieldPathId,
          formData: fd?.[fieldName],
          wasPropertyKeyModified: false,
          onKeyRename: nestSchemaFieldNoop,
          onKeyRenameBlur: nestSchemaFieldNoop,
          onRemoveProperty: nestSchemaFieldNoop,
          onChange: branch.onChange,
          onBlur: branch.onBlur,
          onFocus: branch.onFocus,
          registry: nest.registry,
          disabled: nest.disabled,
          readonly: nest.readonly,
          hideError: nest.hideError,
        };
        return (
          <div
            key={`${String(optionValue)}-${fieldName}`}
            className="mt-2 w-full"
          >
            <SchemaField
              {...(nestFieldProps as unknown as FieldProps<T, TSchema, TForm>)}
            />
          </div>
        );
      });
    },
    [
      nest,
      branch,
      nestedByOption,
      primaryNestedOwner,
      schemaUtils,
      globalFormOptions,
    ]
  );

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

          const nestedFieldNames = nestedByOption?.[String(option.value)];
          const showNestedBlock =
            checked &&
            Boolean(nestedFieldNames && nestedFieldNames.length > 0);

          return (
            <div
              key={indexOptionId}
              className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2 gap-y-1"
            >
              <Checkbox
                className="row-start-1"
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
              <Label
                className="row-start-1 min-w-0 leading-tight"
                htmlFor={indexOptionId}
              >
                {option.label}
              </Label>
              {showNestedBlock ? (
                <div className="col-start-2 row-start-2 flex flex-col gap-3 border-l border-border pl-3">
                  {renderNestedFields(option.value)}
                </div>
              ) : null}
            </div>
          );
        })}
    </div>
  );
}
