import { getSubmitButtonOptions } from '@rjsf/utils'
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  SubmitButtonProps,
} from '@rjsf/utils'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** The `SubmitButton` renders a button that represent the `Submit` action on a form
 */
export default function SubmitButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: SubmitButtonProps<T, TSchema, TForm>) {
  const {
    submitText,
    norender,
    props: submitButtonProps,
  } = getSubmitButtonOptions<T, TSchema, TForm>(props.uiSchema)
  if (norender) {
    return null
  }
  return (
    <div>
      <Button
        type="submit"
        {...submitButtonProps}
        className={cn('my-2', submitButtonProps?.className)}
      >
        {submitText}
      </Button>
    </div>
  )
}
