import { getSubmitButtonOptions } from '@rjsf/utils';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  SubmitButtonProps,
} from '@rjsf/utils';

import { cn } from '@/lib/utils';

import { useFormValidationContext } from '@/integration/shadcn/formValidationContext';

import { Button } from '@/components/ui/button';

/** The `SubmitButton` renders a button that represent the `Submit` action on a form
 */
export default function SubmitButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: SubmitButtonProps<T, TSchema, TForm>) {
  const { uiSchema } = props;
  const {
    submitText,
    norender,
    props: submitButtonProps,
  } = getSubmitButtonOptions<T, TSchema, TForm>(uiSchema);
  const { disableSubmit, markSubmitAttempted } = useFormValidationContext();
  if (norender) {
    return null;
  }
  return (
    <div>
      <Button
        type="submit"
        {...submitButtonProps}
        disabled={disableSubmit || submitButtonProps?.disabled}
        onClick={(event) => {
          markSubmitAttempted();
          submitButtonProps?.onClick?.(event);
        }}
        className={cn('my-2', submitButtonProps?.className)}
      >
        {submitText}
      </Button>
    </div>
  );
}
