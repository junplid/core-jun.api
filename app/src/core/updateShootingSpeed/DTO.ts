export interface UpdateShootingSpeedParamsDTO_I {
  id: number;
}

export interface UpdateShootingSpeedBodyQueryDTO_I {
  name?: string;
  timeBetweenShots?: number;
  timeRest?: number;
  numberShots?: number;
  sequence?: number;
  status?: boolean;
}

export interface UpdateShootingSpeedBodyDTO_I {
  rootId: number;
}

export type UpdateShootingSpeedDTO_I = UpdateShootingSpeedBodyDTO_I &
  UpdateShootingSpeedParamsDTO_I &
  UpdateShootingSpeedBodyQueryDTO_I;
