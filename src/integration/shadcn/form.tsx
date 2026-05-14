import type { FormProps, IChangeEvent } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import type { ComponentType } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { RJSF_FORM_CONTEXT_HAS_VALIDATION_ERRORS } from '@/integration/shadcn/formContextKeys';
import { generateTheme } from '@/integration/shadcn/theme';

export function generateForm<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): ComponentType<FormProps<T, TSchema, TForm>> {
  const ThemedForm = withTheme<T, TSchema, TForm>(
    generateTheme<T, TSchema, TForm>()
  );

  function FormWithSubmitDisabledWhenInvalid(
    props: FormProps<T, TSchema, TForm>
  ) {
    /** When `liveValidate` is `false`, RJSF keeps submit-time errors until the next successful submit; disabling the
     *  button after `onError` would block that retry. */
    const disableSubmitWhenInvalid = props.liveValidate !== false;

    const [hasValidationErrors, setHasValidationErrors] = useState(false);

    const formContext = useMemo((): TForm => {
      const base = (props.formContext ?? {}) as TForm;
      if (!disableSubmitWhenInvalid) {
        return base;
      }
      return {
        ...base,
        [RJSF_FORM_CONTEXT_HAS_VALIDATION_ERRORS]: hasValidationErrors,
      };
    }, [props.formContext, hasValidationErrors, disableSubmitWhenInvalid]);

    const syncFromChangeEvent = useCallback(
      (e: IChangeEvent<T, TSchema, TForm>) => {
        setHasValidationErrors(e.errors.length > 0);
      },
      []
    );

    const {
      formContext: _fc,
      liveValidate,
      onChange,
      onError,
      onSubmit,
      ...rest
    } = props;

    return (
      <ThemedForm
        {...rest}
        formContext={formContext}
        liveValidate={liveValidate ?? 'onChange'}
        onChange={(e, id) => {
          if (disableSubmitWhenInvalid) {
            syncFromChangeEvent(e);
          }
          onChange?.(e, id);
        }}
        onError={(errors) => {
          if (disableSubmitWhenInvalid) {
            setHasValidationErrors(errors.length > 0);
          }
          onError?.(errors);
        }}
        onSubmit={(e, event) => {
          if (disableSubmitWhenInvalid) {
            setHasValidationErrors(false);
          }
          onSubmit?.(e, event);
        }}
      />
    );
  }

  return FormWithSubmitDisabledWhenInvalid;
}

export default generateForm();
