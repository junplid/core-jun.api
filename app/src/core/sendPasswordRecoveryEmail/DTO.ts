export interface SendPasswordRecoveryEmailParamsDTO_I {
  type: "account" | "human-service";
}

export interface SendPasswordRecoveryEmailBodyDTO_I {
  email: string;
}

export type SendPasswordRecoveryEmailDTO_I =
  SendPasswordRecoveryEmailBodyDTO_I & SendPasswordRecoveryEmailParamsDTO_I;
