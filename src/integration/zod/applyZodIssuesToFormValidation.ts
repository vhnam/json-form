import type { ErrorSchema, FieldValidation, FormValidation } from '@rjsf/utils';
import type { z } from 'zod';

type ZodValidationIssue = z.core.$ZodIssue;
type PathSegment = string | number;

function toPathSegments(path: ZodValidationIssue['path']): PathSegment[] {
  return path.filter(
    (segment): segment is PathSegment =>
      typeof segment === 'string' || typeof segment === 'number'
  );
}

function hasSchemaErrorsAtPath<T>(
  errorSchema: ErrorSchema<T> | undefined,
  path: PathSegment[]
): boolean {
  if (!errorSchema) {
    return false;
  }

  let current: ErrorSchema<T> | undefined = errorSchema;
  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return false;
    }
    current = current[segment as keyof ErrorSchema<T>];
  }

  return (current?.__errors?.length ?? 0) > 0;
}

/** Clears the mutable `FormValidation` tree passed into `customValidate`. */
export function clearAllFormValidationErrors<T>(
  errors: FormValidation<T>
): void {
  if (typeof errors !== 'object') {
    return;
  }

  if ('__errors' in errors && Array.isArray(errors.__errors)) {
    errors.__errors = [];
  }

  for (const key of Object.keys(errors)) {
    if (key === '__errors' || key === 'addError') {
      continue;
    }
    const child = errors[key as keyof FormValidation<T>];
    if (child && typeof child === 'object') {
      clearAllFormValidationErrors(child as FormValidation<T>);
    }
  }
}

/** Removes all AJV `__errors` entries so only Zod messages remain after `customValidate` merge. */
export function clearAllSchemaErrors<T>(
  errorSchema: ErrorSchema<T> | undefined
): void {
  if (!errorSchema || typeof errorSchema !== 'object') {
    return;
  }

  if ('__errors' in errorSchema && Array.isArray(errorSchema.__errors)) {
    errorSchema.__errors = [];
  }

  for (const key of Object.keys(errorSchema)) {
    if (key === '__errors') {
      continue;
    }
    const child = errorSchema[key as keyof ErrorSchema<T>];
    if (child && typeof child === 'object') {
      clearAllSchemaErrors(child as ErrorSchema<T>);
    }
  }
}

/** Clears AJV messages on `errorSchema` so Zod copy can replace them after merge. */
function clearSchemaErrorsAtPath<T>(
  errorSchema: ErrorSchema<T> | undefined,
  path: PathSegment[]
): void {
  if (!errorSchema || path.length === 0) {
    return;
  }

  let current: ErrorSchema<T> = errorSchema;
  for (let i = 0; i < path.length - 1; i++) {
    const segment = path[i];
    const next = current[segment as keyof ErrorSchema<T>];
    if (!next || typeof next !== 'object') {
      return;
    }
    current = next;
  }

  const leaf = current[path[path.length - 1] as keyof ErrorSchema<T>];
  if (leaf && typeof leaf === 'object' && '__errors' in leaf) {
    (leaf as { __errors?: string[] }).__errors = [];
  }
}

function fieldValidationAtPath<T>(
  errors: FormValidation<T>,
  path: PathSegment[]
): FieldValidation | undefined {
  let current: FormValidation<T> | undefined = errors;

  for (const segment of path) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[segment as keyof FormValidation<T>];
  }

  return current;
}

function ensureFieldValidationAtPath<T>(
  errors: FormValidation<T>,
  path: PathSegment[]
): FieldValidation {
  let current: FieldValidation | FormValidation<T> = errors;

  for (const segment of path) {
    const existing =
      typeof current === 'object'
        ? (current as Record<string, FieldValidation | undefined>)[
            String(segment)
          ]
        : undefined;
    if (existing && typeof existing === 'object' && 'addError' in existing) {
      current = existing;
      continue;
    }

    const child: FieldValidation = {
      __errors: [],
      addError(message: string) {
        this.__errors!.push(message);
      },
    };
    Object.assign(current, { [segment]: child });
    current = child;
  }

  return current;
}

export type ApplyZodIssuesOptions<T> = {
  errorSchema?: ErrorSchema<T>;
  /**
   * When true (default), Zod messages replace AJV messages on the same field.
   * When false, Zod messages are skipped if AJV already reported an error there.
   */
  preferZodMessages?: boolean;
};

/** Maps Zod issues onto RJSF's mutable `FormValidation` tree from `customValidate`. */
export function applyZodIssuesToFormValidation<T>(
  issues: readonly ZodValidationIssue[],
  errors: FormValidation<T>,
  options: ApplyZodIssuesOptions<T> = {}
): void {
  const { errorSchema, preferZodMessages = true } = options;

  for (const issue of issues) {
    const path = toPathSegments(issue.path);

    if (!preferZodMessages && hasSchemaErrorsAtPath(errorSchema, path)) {
      continue;
    }

    if (preferZodMessages) {
      clearSchemaErrorsAtPath(errorSchema, path);
    }

    const field =
      fieldValidationAtPath(errors, path) ??
      ensureFieldValidationAtPath(errors, path);
    field.addError(issue.message);
  }
}
