import { errorId } from '@rjsf/utils';
import type {
  FieldErrorProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

import { useFormValidationContext } from '@/integration/shadcn/formValidationContext';

/** The `FieldErrorTemplate` component renders the errors local to the particular field
 *
 * @param props - The `FieldErrorProps` for the errors being rendered
 */
export default function FieldErrorTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: FieldErrorProps<T, TSchema, TForm>) {
  const { errors = [], fieldPathId } = props;
  const { showFieldErrors } = useFormValidationContext();
  if (!showFieldErrors || errors.length === 0) {
    return null;
  }
  const id = errorId(fieldPathId);

  return (
    <div className="flex flex-col gap-1" id={id}>
      {errors.map((error, i: number) => {
        return (
          <span className={'mb-1 text-xs font-medium text-destructive'} key={i}>
            {error}
          </span>
        );
      })}
    </div>
  );
}
