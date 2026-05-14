import { getDefaultRegistry } from '@rjsf/core';
import type { FieldProps, RJSFSchema } from '@rjsf/utils';
import { useMemo } from 'react';

const BaseArrayField = getDefaultRegistry().fields.ArrayField;

type SchemaWithPrefixItems = RJSFSchema & { prefixItems?: RJSFSchema[] };

/** RJSF's core `ArrayField` only treats fixed tuples when `items` is a non-empty schema array. JSON Schema 2020-12 uses
 * `prefixItems` for that; we mirror `prefixItems` into `items` for UI only so Ajv still validates the 2020-12 schema. */
export default function ArrayField(props: FieldProps) {
  const schema = useMemo(() => {
    const s = props.schema as SchemaWithPrefixItems;
    if (!Array.isArray(s.prefixItems) || s.prefixItems.length === 0) {
      return props.schema;
    }
    if (Array.isArray(s.items)) {
      return props.schema;
    }
    return { ...props.schema, items: s.prefixItems };
  }, [props.schema]);

  return <BaseArrayField {...props} schema={schema} />;
}
