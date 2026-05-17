import type {
  CustomValidator,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import type { ZodSafeParseResult, ZodType } from 'zod';

import {
  applyZodIssuesToFormValidation,
  clearAllFormValidationErrors,
  clearAllSchemaErrors,
} from '@/integration/zod/applyZodIssuesToFormValidation';

type ZodFormValidatorsOptions = {
  preferZodMessages?: boolean;
  replaceSchemaErrors?: boolean;
};

export type ZodFormValidation<
  T,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = FormContextType,
> = {
  customValidate: CustomValidator<T, TSchema, TForm>;
  isFormValid: (formData: unknown) => formData is T;
};

function applyZodResultToRjsf<T>(
  result: ZodSafeParseResult<T>,
  errors: Parameters<CustomValidator<T>>[1],
  errorSchema: Parameters<CustomValidator<T>>[3],
  options: ZodFormValidatorsOptions
) {
  const preferZodMessages = options.preferZodMessages ?? true;
  const replaceSchemaErrors = options.replaceSchemaErrors ?? true;

  if (result.success) {
    if (replaceSchemaErrors) {
      clearAllSchemaErrors(errorSchema);
      clearAllFormValidationErrors(errors);
    }
    return;
  }

  if (replaceSchemaErrors) {
    clearAllSchemaErrors(errorSchema);
    clearAllFormValidationErrors(errors);
  }

  applyZodIssuesToFormValidation(result.error.issues, errors, {
    errorSchema,
    preferZodMessages,
  });
}

/** Shared Zod parse for `isFormValid` + `customValidate` (one parse per formData reference). */
export function createZodFormValidators<
  T,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = FormContextType,
>(
  schema: ZodType<T>,
  options: ZodFormValidatorsOptions = {}
): ZodFormValidation<T, TSchema, TForm> {
  let cachedFormData: unknown;
  let cachedResult: ZodSafeParseResult<T> | undefined;

  const parse = (formData: unknown): ZodSafeParseResult<T> => {
    if (formData === cachedFormData && cachedResult !== undefined) {
      return cachedResult;
    }
    cachedFormData = formData;
    cachedResult = schema.safeParse(formData);
    return cachedResult;
  };

  const isFormValid = (formData: unknown): formData is T =>
    parse(formData).success;

  const customValidate: CustomValidator<T, TSchema, TForm> = (
    formData,
    errors,
    _uiSchema,
    errorSchema
  ) => {
    applyZodResultToRjsf(parse(formData), errors, errorSchema, options);
    return errors;
  };

  return { customValidate, isFormValid };
}

/** @deprecated Prefer `createZodFormValidators` for a shared parse cache. */
export function createZodIsFormValid<T>(schema: ZodType<T>) {
  return (formData: unknown): formData is T =>
    schema.safeParse(formData).success;
}

export function createZodCustomValidate<
  T,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = FormContextType,
>(
  schema: ZodType<T>,
  options: ZodFormValidatorsOptions = {}
): CustomValidator<T, TSchema, TForm> {
  return createZodFormValidators<T, TSchema, TForm>(schema, options)
    .customValidate;
}
