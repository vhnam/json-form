import { TranslatableString } from '@rjsf/utils';
import type {
  FormContextType,
  IconButtonProps,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';
import type { VariantProps } from 'class-variance-authority';
import { ChevronDown, ChevronUp, Copy, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { buttonVariants } from '@/components/ui/button';

export type ShadIconButtonProps<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
> = IconButtonProps<T, TSchema, TForm> & VariantProps<typeof buttonVariants>;

/** Base button component that renders a Shadcn button with an icon for RJSF form actions.
 * This component serves as the foundation for other specialized buttons used in array operations.
 * It combines RJSF's IconButtonProps with Shadcn's ButtonProps to provide a consistent styling
 * and behavior across the form.
 *
 * @param props - The combined props from RJSF IconButtonProps and Shadcn ButtonProps, including icon and event handlers
 */
export default function IconButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const { icon, iconType, className, uiSchema, registry, ...otherProps } =
    props;
  return (
    <Button
      size="icon"
      variant="outline"
      className={className}
      {...otherProps}
      type="button"
    >
      {icon}
    </Button>
  );
}

/** Renders a copy button for RJSF array fields that allows users to duplicate array items.
 * The button includes a copy icon and uses the RJSF translation system for the tooltip text.
 * This is used within ArrayField to provide item duplication functionality.
 *
 * @param props - The RJSF icon button properties, including registry for translations and event handlers
 */
export function CopyButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <IconButton
      title={translateString(TranslatableString.CopyButton)}
      {...props}
      icon={<Copy className="h-4 w-4" />}
    />
  );
}

/** Renders a move down button for RJSF array fields that allows reordering of array items.
 * The button includes a chevron-down icon and uses the RJSF translation system for the tooltip text.
 * This is used within ArrayField to allow moving items to a lower index in the array.
 *
 * @param props - The RJSF icon button properties, including registry for translations and event handlers
 */
export function MoveDownButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <IconButton
      title={translateString(TranslatableString.MoveDownButton)}
      {...props}
      icon={<ChevronDown className="h-4 w-4" />}
    />
  );
}

/** Renders a move up button for RJSF array fields that allows reordering of array items.
 * The button includes a chevron-up icon and uses the RJSF translation system for the tooltip text.
 * This is used within ArrayField to allow moving items to a higher index in the array.
 *
 * @param props - The RJSF icon button properties, including registry for translations and event handlers
 */
export function MoveUpButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <IconButton
      title={translateString(TranslatableString.MoveUpButton)}
      {...props}
      icon={<ChevronUp className="h-4 w-4" />}
    />
  );
}

/** Renders a remove button for RJSF array fields that allows deletion of array items.
 * The button includes a trash icon and uses the RJSF translation system for the tooltip text.
 * It has special styling with destructive colors to indicate its dangerous action.
 * This is used within ArrayField to provide item removal functionality.
 *
 * @param props - The RJSF icon button properties, including registry for translations and event handlers
 */
export function RemoveButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <IconButton
      title={translateString(TranslatableString.RemoveButton)}
      {...props}
      className={'border-destructive'}
      icon={<Trash2 className="h-4 w-4 stroke-destructive" />}
    />
  );
}

export function ClearButton<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ShadIconButtonProps<T, TSchema, TForm>) {
  const {
    registry: { translateString },
  } = props;
  return (
    <IconButton
      title={translateString(TranslatableString.ClearButton)}
      {...props}
      icon={<X />}
    />
  );
}
