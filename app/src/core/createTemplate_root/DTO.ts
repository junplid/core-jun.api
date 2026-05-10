export interface CreateTemplate_root_DTO_I {
  title: string;
  card_desc: string;
  markdown_desc: string;
  script_runner: string;
  type?: string;
  sections: {
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
