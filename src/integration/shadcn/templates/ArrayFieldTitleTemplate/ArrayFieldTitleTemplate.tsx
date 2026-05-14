import { getTemplate, getUiOptions, titleId } from '@rjsf/utils';
import type {
  ArrayFieldTitleProps,
  FormContextType,
  RJSFSchema,
  StrictRJSFSchema,
} from '@rjsf/utils';

function hasVisibleTitle(title: string | undefined): boolean {
  return typeof title === 'string' && title.trim().length > 0;
}

/** Renders an array field title, or a bordered frame when the title is empty but the label region should show. */
export default function ArrayFieldTitleTemplate<
  T = any,
  TSchema extends StrictRJSFSchema = RJSFSchema,
  TForm extends FormContextType = any,
>({
  fieldPathId,
  title,
  schema,
  uiSchema,
  required,
  registry,
  optionalDataControl,
}: ArrayFieldTitleProps<T, TSchema, TForm>) {
  const options = getUiOptions<T, TSchema, TForm>(
    uiSchema,
    registry.globalUiOptions
  );
  const { label: displayLabel = true } = options;

  if (!displayLabel) {
    return null;
  }

  if (!hasVisibleTitle(title)) {
    return (
      <div
        id={titleId(fieldPathId)}
        className="my-2 rounded-md border border-border px-2 py-2"
        aria-hidden={optionalDataControl ? undefined : true}
      >
        {optionalDataControl ? (
          <div className="flex flex-row">
            <div className="min-w-0 flex-1" />
            <div className="flex shrink-0">{optionalDataControl}</div>
          </div>
        ) : null}
      </div>
    );
  }

  const TitleFieldTemplate = getTemplate<
    'TitleFieldTemplate',
    T,
    TSchema,
    TForm
  >('TitleFieldTemplate', registry, options);

  return (
    <TitleFieldTemplate
      id={titleId(fieldPathId)}
      title={title!}
      required={required}
      schema={schema}
      uiSchema={uiSchema}
      registry={registry}
      optionalDataControl={optionalDataControl}
    />
  );
}
