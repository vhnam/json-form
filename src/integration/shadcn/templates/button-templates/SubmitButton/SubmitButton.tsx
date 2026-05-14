import { getSubmitButtonOptions } from '@rjsf/utils';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  SubmitButtonProps,
} from '@rjsf/utils';

import { cn } from '@/lib/utils';

import { RJSF_FORM_CONTEXT_HAS_VALIDATION_ERRORS } from '@/integration/shadcn/formContextKeys';

import { Button } from '@/components/ui/button';

/** The `SubmitButton` renders a button that represent the `Submit` action on a form
 */
export default function SubmitButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: SubmitButtonProps<T, TSchema, TForm>) {
  const { registry, uiSchema } = props;
  const {
    submitText,
    norender,
    props: submitButtonProps,
  } = getSubmitButtonOptions<T, TSchema, TForm>(uiSchema);
  if (norender) {
    return null;
  }
  const hasValidationErrors =
    registry.formContext[RJSF_FORM_CONTEXT_HAS_VALIDATION_ERRORS] === true;
  return (
    <div>
      <Button
        type="submit"
        {...submitButtonProps}
        disabled={hasValidationErrors || submitButtonProps?.disabled}
        className={cn('my-2', submitButtonProps?.className)}
      >
        {submitText}
      </Button>
    </div>
  );
}
