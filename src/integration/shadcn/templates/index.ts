import type {
    FormContextType,
    RJSFSchema,
    StrictRJSFSchema,
    TemplatesType,
  } from '@rjsf/utils';
  
  import AddButton from '@/integration/shadcn/templates/AddButton';
  import ArrayFieldItemTemplate from '@/integration/shadcn/templates/ArrayFieldItemTemplate';
  import ArrayFieldTemplate from '@/integration/shadcn/templates/ArrayFieldTemplate';
  import ArrayFieldTitleTemplate from '@/integration/shadcn/templates/ArrayFieldTitleTemplate';
  import BaseInputTemplate from '@/integration/shadcn/templates/BaseInputTemplate/BaseInputTemplate';
  import DescriptionField from '@/integration/shadcn/templates/DescriptionField';
  import ErrorList from '@/integration/shadcn/templates/ErrorList';
  import FieldErrorTemplate from '@/integration/shadcn/templates/FieldErrorTemplate';
  import FieldHelpTemplate from '@/integration/shadcn/templates/FieldHelpTemplate';
  import FieldTemplate from '@/integration/shadcn/templates/FieldTemplate';
  import GridTemplate from '@/integration/shadcn/templates/GridTemplate';
  import {
    ClearButton,
    CopyButton,
    MoveDownButton,
    MoveUpButton,
    RemoveButton,
  } from '@/integration/shadcn/templates/IconButton';
  import MultiSchemaFieldTemplate from '@/integration/shadcn/templates/MultiSchemaFieldTemplate';
  import ObjectFieldTemplate from '@/integration/shadcn/templates/ObjectFieldTemplate';
  import OptionalDataControlsTemplate from '@/integration/shadcn/templates/OptionalDataControlsTemplate';
  import SubmitButton from '@/integration/shadcn/templates/SubmitButton';
  import TitleField from '@/integration/shadcn/templates/TitleField';
  import WrapIfAdditionalTemplate from '@/integration/shadcn/templates/WrapIfAdditionalTemplate';
  
  export function generateTemplates<
    T = any,
    TSchema extends StrictRJSFSchema = RJSFSchema,
    TForm extends FormContextType = any,
  >(): Partial<TemplatesType<T, TSchema, TForm>> {
    return {
      ArrayFieldItemTemplate,
      ArrayFieldTemplate,
      ArrayFieldTitleTemplate,
      BaseInputTemplate,
      ButtonTemplates: {
        AddButton,
        CopyButton,
        MoveDownButton,
        MoveUpButton,
        RemoveButton,
        SubmitButton,
        ClearButton,
      },
      DescriptionFieldTemplate: DescriptionField,
      ErrorListTemplate: ErrorList,
      FieldErrorTemplate,
      FieldHelpTemplate,
      FieldTemplate,
      GridTemplate,
      MultiSchemaFieldTemplate,
      ObjectFieldTemplate,
      OptionalDataControlsTemplate,
      TitleFieldTemplate: TitleField,
      WrapIfAdditionalTemplate,
    };
  }
  
  export default generateTemplates();
  