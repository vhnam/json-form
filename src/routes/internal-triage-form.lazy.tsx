import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { createLazyFileRoute } from '@tanstack/react-router';

import Form from '@/integration/shadcn/src';

import schema from '@/assets/internal-triage-form.schema.json';
import uiSchema from '@/assets/internal-triage-form.ui-schema.json';

export const Route = createLazyFileRoute('/internal-triage-form')({
  component: InternalTriageForm,
});

function InternalTriageForm() {
  const handleSubmit = ({
    formData,
  }: IChangeEvent<Record<string, unknown>>) => {
    console.log(formData);
  };

  return (
    <div>
      <Form
        schema={schema as unknown as RJSFSchema}
        uiSchema={uiSchema}
        validator={validator}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
