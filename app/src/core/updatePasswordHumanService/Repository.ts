export interface PropsUpdate {
  accountId: number;
  password: string;
  type: "attendant" | "supervisor";
}

export interface UpdatePasswordHumanServiceRepository_I {
  alreadyExisting(
    id: number,
    type: "attendant" | "supervisor"
  ): Promise<boolean>;
  update(props: PropsUpdate): Promise<void>;
}
