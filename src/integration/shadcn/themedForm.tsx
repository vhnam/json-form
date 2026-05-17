import type { FormProps } from '@rjsf/core';
import { withTheme } from '@rjsf/core';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import type { ComponentType } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  RJSF_FORM_CONTEXT_IS_FORM_INCOMPLETE,
  RJSF_FORM_CONTEXT_SHOW_FIELD_ERRORS,
  RJSF_FORM_CONTEXT_SUBMIT_ATTEMPTED,
} from '@/integration/shadcn/formContextKeys';
import { FormValidationContext } from '@/integration/shadcn/formValidationContext';
import { generateTheme } from '@/integration/shadcn/theme';

export type FormValidationMode = 'submitThenChange' | 'onChange';

type SubmitThenChangeProps<
  T,
  TSchema extends StrictRJSFSchema,
  TForm extends FormContextType,
> = FormProps<T, TSchema, TForm> & {
  validationMode?: 'submitThenChange';
  /** Required: silent check for steps 1–2 (enable Submit when all required fields are filled). */
  isFormValid: (formData: T | undefined) => boolean;
  disableSubmitWhenInvalid?: boolean;
};

type OnChangeValidationProps<
  T,
  TSchema extends StrictRJSFSchema,
  TForm extends FormContextType,
> = FormProps<T, TSchema, TForm> & {
  validationMode: 'onChange';
  isFormValid?: (formData: T | undefined) => boolean;
  disableSubmitWhenInvalid?: boolean;
};

export type ThemedFormProps<
  T,
  TSchema extends StrictRJSFSchema,
  TForm extends FormContextType,
> =
  | SubmitThenChangeProps<T, TSchema, TForm>
  | OnChangeValidationProps<T, TSchema, TForm>;

export function generateForm<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(): ComponentType<ThemedFormProps<T, TSchema, TForm>> {
  const ThemedForm = withTheme<T, TSchema, TForm>(
    generateTheme<T, TSchema, TForm>()
  );

  function FormWithValidationMode(props: ThemedFormProps<T, TSchema, TForm>) {
    const {
      isFormValid,
      validationMode = 'submitThenChange',
      disableSubmitWhenInvalid = true,
    } = props;
    const isSubmitThenChange = validationMode === 'submitThenChange';

    const submitAttemptedRef = useRef(false);
    const missingIsFormValidWarnedRef = useRef(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [isFormComplete, setIsFormComplete] = useState(false);
    const [liveValidationEnabled, setLiveValidationEnabled] = useState(false);

    const showFieldErrors =
      !isSubmitThenChange || submitAttemptedRef.current || submitAttempted;

    const disableSubmit = disableSubmitWhenInvalid !== false && !isFormComplete;

    // Step 3: onChange validation only after required fields are complete (step 2).
    const liveValidate = isSubmitThenChange
      ? liveValidationEnabled
        ? 'onChange'
        : false
      : (props.liveValidate ?? 'onChange');

    const markSubmitAttempted = useCallback(() => {
      if (submitAttemptedRef.current) {
        return;
      }
      submitAttemptedRef.current = true;
      setSubmitAttempted(true);
    }, []);

    const syncFormComplete = useCallback(
      (formData: T | undefined, rjsfErrorCount?: number) => {
        let complete: boolean;

        if (isSubmitThenChange) {
          if (!isFormValid) {
            if (import.meta.env.DEV && !missingIsFormValidWarnedRef.current) {
              missingIsFormValidWarnedRef.current = true;
              console.error(
                '[Form] `isFormValid` is required when validationMode is "submitThenChange".'
              );
            }
            return;
          }

          // Steps 1–2: silent Zod completeness check (liveValidate is off).
          // Step 3+: RJSF already ran Zod in customValidate — use error count only.
          if (liveValidationEnabled && rjsfErrorCount !== undefined) {
            complete = rjsfErrorCount === 0;
          } else {
            complete = isFormValid(formData);
          }

          setIsFormComplete(complete);
          setLiveValidationEnabled(complete);
          return;
        }

        if (rjsfErrorCount !== undefined) {
          complete = rjsfErrorCount === 0;
        } else if (isFormValid) {
          complete = isFormValid(formData);
        } else {
          return;
        }

        setIsFormComplete(complete);
      },
      [isFormValid, isSubmitThenChange, liveValidationEnabled]
    );

    const validationContextValue = useMemo(
      () => ({
        disableSubmit,
        markSubmitAttempted,
        showFieldErrors,
        submitAttempted,
      }),
      [disableSubmit, markSubmitAttempted, showFieldErrors, submitAttempted]
    );

    const formContext = useMemo((): TForm => {
      const base = (props.formContext ?? {}) as TForm;
      return {
        ...base,
        [RJSF_FORM_CONTEXT_SHOW_FIELD_ERRORS]: showFieldErrors,
        [RJSF_FORM_CONTEXT_SUBMIT_ATTEMPTED]: submitAttempted,
        [RJSF_FORM_CONTEXT_IS_FORM_INCOMPLETE]: !isFormComplete,
      };
    }, [props.formContext, showFieldErrors, submitAttempted, isFormComplete]);

    const {
      formContext: _fc,
      liveValidate: _liveValidate,
      noHtml5Validate,
      onChange,
      onError,
      onSubmit,
      showErrorList = false,
      validationMode: _validationMode,
      isFormValid: _isFormValid,
      disableSubmitWhenInvalid: _disableSubmitWhenInvalid,
      ...rest
    } = props;

    return (
      <FormValidationContext.Provider value={validationContextValue}>
        <ThemedForm
          {...rest}
          formContext={formContext}
          showErrorList={showErrorList}
          noHtml5Validate={noHtml5Validate ?? true}
          liveValidate={liveValidate}
          onChange={(e, id) => {
            syncFormComplete(e.formData, e.errors.length);
            onChange?.(e, id);
          }}
          onError={(errors) => {
            if (isSubmitThenChange) {
              queueMicrotask(markSubmitAttempted);
            }
            onError?.(errors);
          }}
          onSubmit={(e, event) => {
            if (isSubmitThenChange) {
              queueMicrotask(markSubmitAttempted);
            }
            syncFormComplete(e.formData, 0);
            onSubmit?.(e, event);
          }}
        />
      </FormValidationContext.Provider>
    );
  }

  return FormWithValidationMode;
}

export const ThemedForm = generateForm();
