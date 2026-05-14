import { ariaDescribedByIds, rangeSpec } from '@rjsf/utils'
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils'

import { Slider } from '@/components/ui/slider'

const allowedProps = [
  'name',
  'min',
  'max',
  'step',
  'orientation',
  'disabled',
  'defaultValue',
  'value',
  'onValueChange',
  'className',
  'dir',
  'inverted',
  'minStepsBetweenThumbs',
]

function pickUiProps(source: unknown): Record<string, unknown> {
  if (source == null || typeof source !== 'object') {
    return {}
  }
  const src = source as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of allowedProps) {
    if (key in src) {
      out[key] = src[key]
    }
  }
  return out
}

/**
 * A range widget component that renders a slider for number input
 * @param {object} props - The widget properties
 * @param {number} props.value - The current value of the range
 * @param {boolean} props.readonly - Whether the widget is read-only
 * @param {boolean} props.disabled - Whether the widget is disabled
 * @param {object} props.options - Additional options for the widget
 * @param props.schema - The JSON schema for this field
 * @param {(value: any) => void} props.onChange - Callback for when the value changes
 * @param {string} props.label - The label for the range input
 * @param {string} props.id - The unique identifier for the widget
 * @returns {JSX.Element} The rendered range widget
 */
export default function RangeWidget<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  value,
  readonly,
  disabled,
  options,
  schema,
  onChange,
  label,
  id,
}: WidgetProps<T, TSchema, TForm>) {
  const _onChange = (_value: number | readonly number[]) => onChange(_value)

  const sliderProps = { value, label, id, ...rangeSpec<TSchema>(schema) }
  const uiProps = {
    id,
    ...pickUiProps(options.props),
  }
  return (
    <>
      <Slider
        disabled={disabled || readonly}
        min={sliderProps.min}
        max={sliderProps.max}
        step={sliderProps.step}
        value={[value as number]}
        onValueChange={_onChange}
        {...uiProps}
        aria-describedby={ariaDescribedByIds(id)}
      />
      {value}
    </>
  )
}
