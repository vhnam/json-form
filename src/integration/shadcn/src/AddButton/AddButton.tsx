import { TranslatableString } from '@rjsf/utils';
import type {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import { PlusCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';

/**
 * A button component for adding new items in a form
 * @param uiSchema - The UI schema for the form, which can include custom properties
 * @param registry - The registry object containing the form's configuration and utilities
 * @param className - Allow custom class names to be passed for Tailwind CSS styling
 * @param props - The component properties
 */
export default function AddButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  uiSchema,
  registry,
  className,
  ...props
}: IconButtonProps<T, TSchema, TForm>) {
  const { translateString } = registry;
  return (
    <div className="m-0 p-0">
      <Button
        {...props}
        className={cn('w-fit gap-2', className)}
        variant="outline"
        type="button"
      >
        <PlusCircle size={16} />{' '}
        {translateString(TranslatableString.AddItemButton)}
      </Button>
    </div>
  );
}
