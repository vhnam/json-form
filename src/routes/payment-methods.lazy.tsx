import type { IChangeEvent } from '@rjsf/core';
import type { RJSFSchema } from '@rjsf/utils';
import { createLazyFileRoute } from '@tanstack/react-router';

import Form from '@/integration/shadcn/form';
import { createZodFormValidators } from '@/integration/zod/createZodCustomValidate';

import schema from '@/assets/payment-methods/json.schema.json';
import uiSchema from '@/assets/payment-methods/ui.schema.json';
import type { PaymentMethodsFormData } from '@/assets/payment-methods/validation.schema';
import { paymentMethodsZodSchema } from '@/assets/payment-methods/validation.schema';

const customValidate = createZodFormValidators<PaymentMethodsFormData>(
  paymentMethodsZodSchema
);

export const Route = createLazyFileRoute('/payment-methods')({
  component: PaymentMethods,
});

function PaymentMethods() {
  const handleSubmit = ({ formData }: IChangeEvent<PaymentMethodsFormData>) => {
    console.log(formData);
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <h1 className="mb-12 text-2xl font-bold">Payment Methods</h1>
      <Form
        schema={schema as unknown as RJSFSchema}
        uiSchema={uiSchema}
        customValidate={customValidate}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
