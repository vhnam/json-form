import {
  ADDITIONAL_PROPERTY_FLAG,
  TranslatableString,
  buttonId,
} from '@rjsf/utils';
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WrapIfAdditionalTemplateProps,
} from '@rjsf/utils';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

/** The `WrapIfAdditional` component is used by the `FieldTemplate` to rename, or remove properties that are
 * part of an `additionalProperties` part of a schema.
 *
 * @param props - The `WrapIfAdditionalProps` for this component
 */
export default function WrapIfAdditionalTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  classNames,
  style,
  children,
  disabled,
  id,
  label,
  displayLabel,
  onRemoveProperty,
  onKeyRenameBlur,
  rawDescription,
  readonly,
  required,
  schema,
  uiSchema,
  registry,
}: WrapIfAdditionalTemplateProps<T, TSchema, TForm>) {
  const { templates, translateString } = registry;
  // Button templates are not overridden in the uiSchema
  const { RemoveButton } = templates.ButtonTemplates;
  const keyLabel = translateString(TranslatableString.KeyLabel, [label]);
  const additional = ADDITIONAL_PROPERTY_FLAG in schema;

  if (!additional) {
    return (
      <div className={classNames} style={style}>
        {children}
      </div>
    );
  }

  const marginDesc = rawDescription ? -28 : 0;
  const margin = displayLabel ? 22 + marginDesc : 0;
  const keyId = `${id}-key`;

  return (
    <>
      <div
        className={`col-span-12 grid grid-cols-12 items-center gap-2 ${classNames}`}
        style={style}
      >
        <div className="col-span-5 grid gap-2">
          <div className="flex flex-col gap-2">
            {displayLabel && (
              <Label
                htmlFor={keyId}
                className="text-sm leading-none font-medium text-muted-foreground"
              >
                {keyLabel}
              </Label>
            )}
            <div className="pl-0.5">
              <Input
                key={label}
                required={required}
                defaultValue={label}
                disabled={disabled || readonly}
                id={keyId}
                name={keyId}
                onBlur={!readonly ? onKeyRenameBlur : undefined}
                type="text"
                className="w-full border shadow-sm"
              />
            </div>
            {!!rawDescription && (
              <span className="text-xs font-medium text-muted-foreground">
                <div className="text-sm text-muted-foreground">&nbsp;</div>
              </span>
            )}
          </div>
        </div>
        <div className="col-span-6 grid gap-2 pr-0.5">{children}</div>
        <div
          className="col-span-1 grid gap-2"
          style={{ marginTop: `${margin}px` }}
        >
          <RemoveButton
            id={buttonId(id, 'remove')}
            iconType="block"
            className="rjsf-object-property-remove w-full"
            disabled={disabled || readonly}
            onClick={onRemoveProperty}
            uiSchema={uiSchema}
            registry={registry}
          />
        </div>
      </div>
      <Separator dir="horizontal" className="mt-2" />
    </>
  );
}
