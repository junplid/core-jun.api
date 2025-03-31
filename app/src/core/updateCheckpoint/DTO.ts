import { TypeTag } from "@prisma/client";

export interface UpdateCheckpointParamsDTO_I {
  id: number;
}

export interface UpdateCheckpointQueryDTO_I {
  name?: string;
  businessIds?: number[];
}

export interface UpdateCheckpointBodyDTO_I {
  accountId: number;
}

export type UpdateCheckpointDTO_I = UpdateCheckpointBodyDTO_I &
  UpdateCheckpointParamsDTO_I &
  UpdateCheckpointQueryDTO_I;
