export interface UpdateRootUserQueryDTO_I {
  email: string;
  password: string;
}

export interface UpdateRootUserBodyDTO_I {
  rootId: number;
}

export type UpdateRootUserDTO_I = UpdateRootUserBodyDTO_I &
  UpdateRootUserQueryDTO_I;
