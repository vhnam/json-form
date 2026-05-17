import { createContext, useContext } from 'react';

export type FormValidationContextValue = {
  disableSubmit: boolean;
  showFieldErrors: boolean;
  submitAttempted: boolean;
  /** Call when the user clicks Submit so errors can show on the same validation pass. */
  markSubmitAttempted: () => void;
};

export const FormValidationContext = createContext<FormValidationContextValue>({
  disableSubmit: true,
  showFieldErrors: false,
  submitAttempted: false,
  markSubmitAttempted: () => {},
});

export function useFormValidationContext() {
  return useContext(FormValidationContext);
}
