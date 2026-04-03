export interface PairCodeDeviceParamsDTO_I {
  uuid: string;
}

export interface PairCodeDeviceQueryDTO_I {
  code: string;
}

export interface PairCodeDeviceBodyDTO_I {
  accountId: number;
}

export type PairCodeDeviceDTO_I = PairCodeDeviceBodyDTO_I &
  PairCodeDeviceParamsDTO_I &
  PairCodeDeviceQueryDTO_I;
