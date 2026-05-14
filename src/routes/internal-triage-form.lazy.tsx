import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { customizeValidator } from '@rjsf/validator-ajv8';
import { createLazyFileRoute } from '@tanstack/react-router';
import Ajv2020 from 'ajv/dist/2020';

import Form from '@/integration/shadcn/form';

import schema from '@/assets/internal-triage-form/json.schema.json';
import uiSchema from '@/assets/internal-triage-form/ui.schema.json';

const validator = customizeValidator({ AjvClass: Ajv2020 });

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
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-12 text-2xl font-bold">Internal Triage Form</h1>
      <Form
        schema={schema as unknown as RJSFSchema}
        uiSchema={uiSchema}
        validator={validator}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
