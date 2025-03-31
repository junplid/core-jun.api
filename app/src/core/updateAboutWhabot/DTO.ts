export interface UpdateHelpSessionParamsDTO_I {
  page:
    | "about-whabot"
    | "faq"
    | "report-bugs-and-suggestions"
    | "support-contacts"
    | "whats-new"
    | "help-center"
    | "whabot-university"
    | "terms-and-conditions";
}

export interface UpdateHelpSessionBodyDTO_I {
  rootId: number;
  text: string;
}

export type UpdateHelpSessionDTO_I = UpdateHelpSessionBodyDTO_I &
  UpdateHelpSessionParamsDTO_I;
