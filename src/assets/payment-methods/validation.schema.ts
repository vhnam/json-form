import { z } from 'zod';

const paymentMethodValues = [
  'corporate_benefit',
  'private_insurance',
  'self_payment',
] as const;

const byCorporateBenefitValues = ['accenture', 'grab', 'sia', 'other'] as const;

const byPrivateInsuranceValues = [
  'AIA Singapore Pte Ltd',
  'Allianz',
  'AVIVA Limited',
  'AXA Insurance Pte Ltd',
  'Bupa',
  'Cigna',
  'Great Eastern Life Assurance',
  'NTUC Income',
  'Raffles Health Insurance Pte Ltd',
  'Prudential Assurance Company Singapore Pte Limited',
  'Others',
] as const;

const paymentMethodItem = z.enum(paymentMethodValues);
const byCorporateBenefit = z.enum(byCorporateBenefitValues);
const byPrivateInsurance = z.enum(byPrivateInsuranceValues);

function normalizePaymentMethod(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

export const paymentMethodsZodSchema = z
  .object({
    paymentMethod: z.preprocess(normalizePaymentMethod, z.array(z.string())),
    byCorporateBenefit: z.string().optional(),
    byCorporateBenefitOther: z.string().optional(),
    byPrivateInsurance: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const methods = data.paymentMethod;

    if (methods.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['paymentMethod'],
        message: 'Select at least one payment method',
      });
    } else if (
      methods.some((method) => !paymentMethodItem.safeParse(method).success)
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['paymentMethod'],
        message: 'Select at least one payment method',
      });
    }

    if (methods.includes('corporate_benefit')) {
      if (!data.byCorporateBenefit) {
        ctx.addIssue({
          code: 'custom',
          path: ['byCorporateBenefit'],
          message: 'Select a corporate benefit provider',
        });
      } else if (
        !byCorporateBenefit.safeParse(data.byCorporateBenefit).success
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['byCorporateBenefit'],
          message: 'Select a corporate benefit provider',
        });
      } else if (
        data.byCorporateBenefit === 'other' &&
        !data.byCorporateBenefitOther?.trim()
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['byCorporateBenefitOther'],
          message: 'Specify the company name',
        });
      } else if (
        data.byCorporateBenefit === 'other' &&
        data.byCorporateBenefitOther &&
        data.byCorporateBenefitOther.trim().length < 2
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['byCorporateBenefitOther'],
          message: 'Company name must be at least 2 characters',
        });
      }
    }

    if (methods.includes('private_insurance')) {
      if (!data.byPrivateInsurance) {
        ctx.addIssue({
          code: 'custom',
          path: ['byPrivateInsurance'],
          message: 'Select an insurance provider',
        });
      } else if (
        !byPrivateInsurance.safeParse(data.byPrivateInsurance).success
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['byPrivateInsurance'],
          message: 'Select an insurance provider',
        });
      }
    }
  });

export type PaymentMethodsFormData = z.infer<typeof paymentMethodsZodSchema>;
