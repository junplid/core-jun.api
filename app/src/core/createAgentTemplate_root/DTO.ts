export interface CreateAgentTemplate_root_DTO_I {
  title: string;
  card_desc: string;
  markdown_desc: string;
  config_flow: string;
  script_runner: string;
  script_build_agentai_for_test: string;
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
  chat_demo: string;
  variables?: string[];
  tags?: string[];
}
