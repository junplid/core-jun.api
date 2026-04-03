export interface UnpairCodeDeviceParamsDTO_I {
  uuid: string;
}

export interface UnpairCodeDeviceBodyDTO_I {
  accountId: number;
}

export type UnpairCodeDeviceDTO_I = UnpairCodeDeviceBodyDTO_I &
  UnpairCodeDeviceParamsDTO_I;
