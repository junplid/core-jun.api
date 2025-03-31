export interface PropsAlreadyExisting {
  userId: number;
}

export interface PropsUpdate extends PropsAlreadyExisting {
  name?: string;
  password?: string;
  username?: string;
}

export interface UpdateSectorAttendantOnHumanServiceRepository_I {
  alreadyExisting(props: PropsAlreadyExisting): Promise<number>;
  update(props: PropsUpdate): Promise<void>;
}
