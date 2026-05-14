import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import {
  DateElement,
  TranslatableString,
  parseDateString,
  toDateString,
  useAltDateWidgetProps,
} from '@rjsf/utils'
import type {
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
  WidgetProps,
} from '@rjsf/utils'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const TIME_TYPES = new Set(['hour', 'minute', 'second'])

function nonNegativeOrZero(n: number | undefined): number {
  return typeof n === 'number' && n >= 0 ? n : 0
}

function safeParseDateString(
  value: unknown,
  includeTime: boolean,
): ReturnType<typeof parseDateString> {
  if (value === undefined || value === null || value === '') {
    return parseDateString('', includeTime)
  }
  try {
    return parseDateString(String(value), includeTime)
  } catch {
    return parseDateString('', includeTime)
  }
}

/** The `AltDateWidget` is an alternative widget for rendering date properties.
 * @param props - The `WidgetProps` for this component
 */
function AltDateWidget<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>(props: WidgetProps<T, TSchema, TForm>) {
  const {
    disabled = false,
    readonly = false,
    autofocus = false,
    options,
    id,
    name,
    registry,
    onBlur,
    onFocus,
    time = false,
    value,
    onChange,
    className,
  } = props
  const { translateString } = registry
  const { elements, handleChange, handleClear, handleSetNow } =
    useAltDateWidgetProps(props)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const parsed = useMemo(() => safeParseDateString(value, time), [value, time])

  const selectedDate =
    parsed.year !== -1 && parsed.month !== -1 && parsed.day !== -1
      ? new Date(
          parsed.year,
          parsed.month - 1,
          parsed.day,
          time ? nonNegativeOrZero(parsed.hour) : 0,
          time ? nonNegativeOrZero(parsed.minute) : 0,
          time ? nonNegativeOrZero(parsed.second) : 0,
        )
      : undefined

  const timeElements = time
    ? elements.filter((el) => TIME_TYPES.has(el.type))
    : []

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) {
      return
    }
    const base = safeParseDateString(value, time)
    const merged = {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: time ? nonNegativeOrZero(base.hour) : 0,
      minute: time ? nonNegativeOrZero(base.minute) : 0,
      second: time ? nonNegativeOrZero(base.second) : 0,
    }
    onChange(toDateString(merged, time))
    setPopoverOpen(false)
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          disabled={disabled || readonly}
          render={
            <Button
              type="button"
              variant="outline"
              id={id}
              autoFocus={autofocus && !time}
              data-empty={!selectedDate}
              className="w-[240px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
            />
          }
        >
          <CalendarIcon className="mr-2 size-4 shrink-0" />
          {selectedDate ? (
            format(selectedDate, time ? 'PPP p' : 'PPP')
          ) : (
            <span>{translateString(TranslatableString.AriaDateLabel)}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={handleCalendarSelect}
            disabled={disabled || readonly}
          />

          <div className="flex items-center gap-2 justify-center mb-4">
            {(options.hideNowButton !== 'undefined'
              ? !options.hideNowButton
              : true) && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled || readonly}
                onClick={handleSetNow}
              >
                {translateString(TranslatableString.NowLabel)}
              </Button>
            )}
            {(options.hideClearButton !== 'undefined'
              ? !options.hideClearButton
              : true) && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={disabled || readonly}
                onClick={handleClear}
              >
                {translateString(TranslatableString.ClearLabel)}
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {timeElements.map((elemProps, i) => (
        <div className="contents" key={elemProps.type}>
          <DateElement
            rootId={id}
            name={name}
            select={handleChange}
            {...elemProps}
            disabled={disabled}
            readonly={readonly}
            registry={registry}
            onBlur={onBlur}
            onFocus={onFocus}
            autofocus={autofocus && time && i === 0}
          />
        </div>
      ))}
    </div>
  )
}

export default AltDateWidget
