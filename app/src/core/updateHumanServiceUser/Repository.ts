export interface PropsAlreadyExisting {
  userId: number;
}

export interface PropsUpdate extends PropsAlreadyExisting {
  name?: string;
  password?: string;
  username?: string;
  type: "sectorsAttendants" | "supervisors";
}

export interface UpdateHumanServiceUserRepository_I {
  fetchExist(
    props: PropsAlreadyExisting
  ): Promise<"sectorsAttendants" | "supervisors" | null>;
  update(props: PropsUpdate): Promise<void>;
}
