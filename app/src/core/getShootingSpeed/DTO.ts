export interface GetShootingSpeedParamsDTO_I {
  id: number;
}

export interface GetShootingSpeedBodyDTO_I {
  rootId: number;
}

export type GetShootingSpeedDTO_I = GetShootingSpeedBodyDTO_I &
  GetShootingSpeedParamsDTO_I;
