import {
  buttonId,
  canExpand,
  descriptionId,
  getTemplate,
  getUiOptions,
  titleId,
} from '@rjsf/utils';
import type {
  FormContextType,
  ObjectFieldTemplateProps,
  RJSFSchema,
  StrictRJSFSchema,
  UiSchema,
} from '@rjsf/utils';
import { useMemo } from 'react';

import { cn } from '@/lib/utils';

import {
  CheckboxNestProvider,
  collectNestedPropertyNames,
} from '@/integration/shadcn/context/checkboxNestContext';
import type {
  CheckboxNestContextValue,
  CheckboxNestedFieldsMap,
} from '@/integration/shadcn/context/checkboxNestContext';

/** The `ObjectFieldTemplate` is the template to use to render all the inner properties of an object along with the
 * title and description if available. If the object is expandable, then an `AddButton` is also rendered after all
 * the properties.
 *
 * @param props - The `ObjectFieldTemplateProps` for this component
 */
export default function ObjectFieldTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  description,
  title,
  properties,
  required,
  uiSchema,
  fieldPathId,
  schema,
  formData,
  optionalDataControl,
  onAddProperty,
  disabled,
  readonly,
  registry,
  errorSchema,
  hideError,
}: ObjectFieldTemplateProps<T, TSchema, TForm>) {
  const uiOptions = getUiOptions<T, TSchema, TForm>(
    uiSchema,
    registry.globalUiOptions
  );
  const checkboxNestedFields = (
    uiOptions as { checkboxNestedFields?: CheckboxNestedFieldsMap }
  ).checkboxNestedFields;
  const nestedPropertyNames = useMemo(
    () => collectNestedPropertyNames(checkboxNestedFields),
    [checkboxNestedFields]
  );
  const nestEnabled = Boolean(
    checkboxNestedFields && nestedPropertyNames.size > 0
  );

  const nestValue = useMemo(
    () =>
      nestEnabled && checkboxNestedFields
        ? {
            checkboxNestedFields,
            nestedPropertyNames,
            objectFormData: formData,
            objectUiSchema: (uiSchema ?? {}) as UiSchema,
            objectErrorSchema: errorSchema,
            objectSchema: schema,
            registry,
            hideError,
            disabled: Boolean(disabled),
            readonly: Boolean(readonly),
          }
        : null,
    [
      nestEnabled,
      checkboxNestedFields,
      nestedPropertyNames,
      formData,
      uiSchema,
      errorSchema,
      schema,
      registry,
      hideError,
      disabled,
      readonly,
    ]
  );

  const TitleFieldTemplate = getTemplate<
    'TitleFieldTemplate',
    T,
    TSchema,
    TForm
  >('TitleFieldTemplate', registry, uiOptions);
  const DescriptionFieldTemplate = getTemplate<
    'DescriptionFieldTemplate',
    T,
    TSchema,
    TForm
  >('DescriptionFieldTemplate', registry, uiOptions);
  const showOptionalDataControlInTitle = !readonly && !disabled;
  const {
    ButtonTemplates: { AddButton },
  } = registry.templates;

  const body = (
    <>
      {title && (
        <TitleFieldTemplate
          id={titleId(fieldPathId)}
          title={title}
          required={required}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
          optionalDataControl={
            showOptionalDataControlInTitle ? optionalDataControl : undefined
          }
        />
      )}
      {description && (
        <DescriptionFieldTemplate
          id={descriptionId(fieldPathId)}
          description={description}
          schema={schema}
          uiSchema={uiSchema}
          registry={registry}
        />
      )}
      <div className="flex flex-col gap-6">
        {!showOptionalDataControlInTitle ? optionalDataControl : undefined}
        {properties.map((element: (typeof properties)[number]) => {
          if (nestEnabled && nestedPropertyNames.has(element.name)) {
            return null;
          }
          return (
            <div
              key={element.name}
              className={cn(`${element.hidden ? 'hidden' : ''} flex`)}
            >
              <div className="w-full">{element.content}</div>
            </div>
          );
        })}
        {canExpand(schema, uiSchema, formData) ? (
          <div className="mt-2 flex justify-end">
            <AddButton
              id={buttonId(fieldPathId, 'add')}
              onClick={onAddProperty}
              disabled={disabled || readonly}
              className="rjsf-object-property-expand"
              uiSchema={uiSchema}
              registry={registry}
            />
          </div>
        ) : null}
      </div>
    </>
  );

  return nestValue ? (
    <CheckboxNestProvider
      value={nestValue as unknown as CheckboxNestContextValue}
    >
      {body}
    </CheckboxNestProvider>
  ) : (
    body
  );
}
