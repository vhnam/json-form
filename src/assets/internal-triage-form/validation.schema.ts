import { z } from 'zod';

const triageDecisionValues = [
  'emergency_995',
  'raffles24_acc',
  'home_care',
  'house_call',
  'doctor_outcall',
  'nurse_outcall',
  'gp_referral',
  'rmsg_referral',
] as const;

const caseFrequencyRequirementValues = [
  'one_time',
  'short_term',
  'ongoing',
  'long_term',
] as const;

const frequencyPerWeekValues = [
  '1_time',
  '2_times',
  '3_times',
  '4_times',
  '5_times',
  '6_times',
  '7_times',
] as const;

const patientCareLevelClassificationValues = [
  'level_1',
  'level_2',
  'level_3',
  'level_4',
] as const;

const triageDecision = z.enum(triageDecisionValues);
const caseFrequencyRequirement = z.enum(caseFrequencyRequirementValues);
const frequencyPerWeek = z.enum(frequencyPerWeekValues);
const patientCareLevelClassification = z.enum(
  patientCareLevelClassificationValues
);

const triageGroupInputSchema = z.object({
  triageDecision: z.string().optional(),
  caseFrequencyRequirement: z.string().optional(),
  homeCareStartDate: z.string().optional(),
  houseCallStartDate: z.string().optional(),
  time: z.string().optional(),
  frequencyPerWeek: z.string().optional(),
});

const patientCareGroupInputSchema = z.object({
  patientCareLevelClassification: z.string().optional(),
});

type TriageGroupInput = z.infer<typeof triageGroupInputSchema>;
type PatientCareGroupInput = z.infer<typeof patientCareGroupInputSchema>;

function normalizeGroups(
  value: unknown
): [TriageGroupInput, PatientCareGroupInput] {
  const groups = Array.isArray(value) ? value : [];
  const triage =
    groups[0] && typeof groups[0] === 'object'
      ? (groups[0] as TriageGroupInput)
      : {};
  const patientCare =
    groups[1] && typeof groups[1] === 'object'
      ? (groups[1] as PatientCareGroupInput)
      : {};
  return [triage, patientCare];
}

function validateTriageGroup(
  data: TriageGroupInput,
  ctx: z.RefinementCtx,
  basePath: (string | number)[]
) {
  if (!data.triageDecision) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'triageDecision'],
      message: 'Select a triage decision',
    });
  } else if (!triageDecision.safeParse(data.triageDecision).success) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'triageDecision'],
      message: 'Select a triage decision',
    });
  }

  if (!data.caseFrequencyRequirement) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'caseFrequencyRequirement'],
      message: 'Select a case frequency requirement',
    });
  } else if (
    !caseFrequencyRequirement.safeParse(data.caseFrequencyRequirement).success
  ) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'caseFrequencyRequirement'],
      message: 'Select a case frequency requirement',
    });
  }

  if (data.triageDecision === 'home_care' && !data.homeCareStartDate?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'homeCareStartDate'],
      message: 'Start date is required',
    });
  }

  if (
    data.triageDecision === 'house_call' &&
    !data.houseCallStartDate?.trim()
  ) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'houseCallStartDate'],
      message: 'Start date is required',
    });
  }

  if (data.caseFrequencyRequirement === 'ongoing' && !data.time?.trim()) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'time'],
      message: 'Time is required',
    });
  }

  if (data.caseFrequencyRequirement === 'long_term') {
    if (!data.time?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: [...basePath, 'time'],
        message: 'Time is required',
      });
    }
    if (!data.frequencyPerWeek) {
      ctx.addIssue({
        code: 'custom',
        path: [...basePath, 'frequencyPerWeek'],
        message: 'Select frequency per week',
      });
    } else if (!frequencyPerWeek.safeParse(data.frequencyPerWeek).success) {
      ctx.addIssue({
        code: 'custom',
        path: [...basePath, 'frequencyPerWeek'],
        message: 'Select frequency per week',
      });
    }
  }
}

function validatePatientCareGroup(
  data: PatientCareGroupInput,
  ctx: z.RefinementCtx,
  basePath: (string | number)[]
) {
  if (!data.patientCareLevelClassification) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'patientCareLevelClassification'],
      message: 'Select a patient care level',
    });
  } else if (
    !patientCareLevelClassification.safeParse(
      data.patientCareLevelClassification
    ).success
  ) {
    ctx.addIssue({
      code: 'custom',
      path: [...basePath, 'patientCareLevelClassification'],
      message: 'Select a patient care level',
    });
  }
}

export const internalTriageFormZodSchema = z
  .object({
    groups: z.preprocess(
      normalizeGroups,
      z.tuple([triageGroupInputSchema, patientCareGroupInputSchema])
    ),
  })
  .superRefine((data, ctx) => {
    validateTriageGroup(data.groups[0], ctx, ['groups', 0]);
    validatePatientCareGroup(data.groups[1], ctx, ['groups', 1]);
  });

export type InternalTriageFormData = z.infer<
  typeof internalTriageFormZodSchema
>;
