import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { createLazyFileRoute } from '@tanstack/react-router';

import Form from '@/integration/shadcn/form';
import { createZodFormValidators } from '@/integration/zod/createZodCustomValidate';

import schema from '@/assets/internal-triage-form/json.schema.json';
import uiSchema from '@/assets/internal-triage-form/ui.schema.json';
import type { InternalTriageFormData } from '@/assets/internal-triage-form/validation.schema';
import { internalTriageFormZodSchema } from '@/assets/internal-triage-form/validation.schema';

const customValidate = createZodFormValidators<InternalTriageFormData>(
  internalTriageFormZodSchema
);

export const Route = createLazyFileRoute('/internal-triage-form')({
  component: InternalTriageForm,
});

function InternalTriageForm() {
  const handleSubmit = ({ formData }: IChangeEvent<InternalTriageFormData>) => {
    console.log(formData);
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-12 text-2xl font-bold">Internal Triage Form</h1>
      <Form
        schema={schema as unknown as RJSFSchema}
        uiSchema={uiSchema}
        customValidate={customValidate}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
