export type UpdateTemplate_root_ParamsDTO_I = {
  id: number;
};

export interface UpdateTemplate_root_BodyDTO_I {
  title?: string;
  card_desc?: string;
  markdown_desc?: string;
  type?: string;
  script_runner?: string;
  sections?: {
    name: string;
    title: string;
    inputs: {
      name: string;
      type:
        | "number"
        | "text"
        | "select"
        | "select_variables"
        | "select_variable"
        | "textarea";
      placeholder?: string;
      defaultValue?: string;
      helperText?: string;
      required?: boolean;
    }[];
    collapsible?: boolean;
    desc?: string;
  }[];
  chat_demo?: string;
}

export type UpdateTemplate_root_DTO_I = UpdateTemplate_root_ParamsDTO_I &
  UpdateTemplate_root_BodyDTO_I;
