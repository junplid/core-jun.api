export interface UpdateGeolocationParamsDTO_I {
  id: number;
}

export interface UpdateGeolocationQueryDTO_I {
  name?: string;
  businessIds?: number[];
  address?: string;
  latitude?: string;
  longitude?: string;
}

export interface UpdateGeolocationBodyDTO_I {
  accountId: number;
}

export type UpdateGeolocationDTO_I = UpdateGeolocationBodyDTO_I &
  UpdateGeolocationParamsDTO_I &
  UpdateGeolocationQueryDTO_I;
