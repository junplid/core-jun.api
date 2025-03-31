export interface PropsCreate {
  name: string;
  accountId: number;
}

export interface PropsUpdate {
  fileName: string;
  userId: number;
  type: "sectorsAttendants" | "supervisors";
}

export interface CreateImageHumanServiceUserRepository_I {
  update(props: PropsUpdate): Promise<void>;
  fetchExistUser(userId: number): Promise<{
    type: "sectorsAttendants" | "supervisors";
    oldImage: string | null;
  } | null>;
}
