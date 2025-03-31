export interface UpdateHumanServiceUserBodyDTO_I {
  userId: number;
}

export interface UpdateHumanServiceUserQueryDTO_I {
  name?: string;
  password?: string;
  username?: string;
}

export type UpdateHumanServiceUserDTO_I = UpdateHumanServiceUserBodyDTO_I &
  UpdateHumanServiceUserQueryDTO_I;
