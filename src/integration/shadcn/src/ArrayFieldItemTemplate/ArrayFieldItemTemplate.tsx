import { getTemplate, getUiOptions } from '@rjsf/utils'
import type {
  ArrayFieldItemTemplateProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils'

/** The `ArrayFieldItemTemplate` component is the template used to render an items of an array.
 *
 * @param props - The `ArrayFieldItemTemplateProps` props for the component
 */
export default function ArrayFieldItemTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: ArrayFieldItemTemplateProps<T, TSchema, TForm>) {
  const {
    children,
    buttonsProps,
    displayLabel,
    hasDescription,
    hasToolbar,
    uiSchema,
    registry,
  } = props
  const uiOptions = getUiOptions<T, TSchema, TForm>(uiSchema)
  const ArrayFieldItemButtonsTemplate = getTemplate<
    'ArrayFieldItemButtonsTemplate',
    T,
    TSchema,
    TForm
  >('ArrayFieldItemButtonsTemplate', registry, uiOptions)
  const margin = hasDescription ? -6 : 22
  return (
    <div>
      <div className="mb-2 flex flex-row flex-wrap items-center">
        <div className="grow shrink">{children}</div>
        <div className="flex items-end justify-end p-0.5">
          {hasToolbar && (
            <div
              className="flex gap-2"
              style={{
                marginLeft: '5px',
                marginTop: displayLabel ? `${margin}px` : undefined,
              }}
            >
              <ArrayFieldItemButtonsTemplate {...buttonsProps} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
