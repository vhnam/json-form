/** When `true`, required fields are not yet complete (Submit stays disabled). */
export const RJSF_FORM_CONTEXT_IS_FORM_INCOMPLETE =
  '__rjsfIsFormIncomplete' as const;

/** When `false`, field templates hide validation messages until the first submit attempt. */
export const RJSF_FORM_CONTEXT_SHOW_FIELD_ERRORS =
  '__rjsfShowFieldErrors' as const;

/** When `true`, the user has attempted to submit at least once. */
export const RJSF_FORM_CONTEXT_SUBMIT_ATTEMPTED =
  '__rjsfSubmitAttempted' as const;
