export interface DeleteShootingSpeeParamsDTO_I {
  id: number;
}

export interface DeleteShootingSpeeBodyDTO_I {
  rootId: number;
}

export type DeleteShootingSpeeDTO_I = DeleteShootingSpeeBodyDTO_I &
  DeleteShootingSpeeParamsDTO_I;
