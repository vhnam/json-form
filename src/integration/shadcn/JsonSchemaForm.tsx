import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema, UiSchema } from '@rjsf/utils';
import { customizeValidator } from '@rjsf/validator-ajv8';
import Ajv2020 from 'ajv/dist/2020';

import { ThemedForm, type FormValidationMode } from '@/integration/shadcn/themedForm';
import type { ZodFormValidation } from '@/integration/zod/createZodCustomValidate';

const validator = customizeValidator({ AjvClass: Ajv2020 });

export type JsonSchemaFormProps<T = unknown> = {
  schema: RJSFSchema;
  uiSchema?: UiSchema;
  onSubmit: (event: IChangeEvent<T>) => void;
  /** Pass the result of `createZodFormValidators(schema)`. */
  customValidate: ZodFormValidation<T>;
  validationMode?: FormValidationMode;
  disableSubmitWhenInvalid?: boolean;
  formData?: T;
  initialFormData?: T;
};

export default function JsonSchemaForm<T>({
  schema,
  uiSchema,
  onSubmit,
  customValidate,
  validationMode,
  disableSubmitWhenInvalid,
  formData,
  initialFormData,
}: JsonSchemaFormProps<T>) {
  return (
    <ThemedForm
      schema={schema}
      uiSchema={uiSchema}
      validator={validator}
      customValidate={customValidate.customValidate}
      isFormValid={customValidate.isFormValid}
      onSubmit={onSubmit}
      validationMode={validationMode}
      disableSubmitWhenInvalid={disableSubmitWhenInvalid}
      formData={formData}
      initialFormData={initialFormData}
    />
  );
}
