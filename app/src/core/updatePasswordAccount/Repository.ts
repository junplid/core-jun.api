export interface PropsUpdate {
  accountId: number;
  password: string;
}

export interface UpdatePasswordAccountRepository_I {
  alreadyExisting(id: number): Promise<boolean>;
  update(props: PropsUpdate): Promise<void>;
}
