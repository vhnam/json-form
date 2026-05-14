import type { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { createFileRoute } from '@tanstack/react-router';

import Form from '@/integration/shadcn/src';

import schema from '@/assets/internal-triage-form.schema.json';
import uiSchema from '@/assets/internal-triage-form.ui.json';

export const Route = createFileRoute('/internal-triage-form')({
  component: InternalTriageForm,
});

function InternalTriageForm() {
  const handleSubmit = (data: any) => {
    console.log(data);
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
