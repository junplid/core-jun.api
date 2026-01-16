import { TypeConnetion } from "@prisma/client";
import {
  WAPrivacyOnlineValue,
  WAPrivacyValue,
  WAReadReceiptsValue,
  WAPrivacyGroupAddValue,
} from "baileys";

export interface UpdateConnectionWABodyDTO_I {
  accountId: number;
  name?: string;
  description?: string;
  businessId?: number;
  type?: TypeConnetion;
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: WAPrivacyValue;
  onlinePrivacy?: WAPrivacyOnlineValue;
  imgPerfilPrivacy?: WAPrivacyValue;
  statusPrivacy?: WAPrivacyValue;
  groupsAddPrivacy?: WAPrivacyGroupAddValue;
  readReceiptsPrivacy?: WAReadReceiptsValue;
  fileNameImage?: string;
}

export interface UpdateConnectionWAParamsDTO_I {
  id: number;
}

export type UpdateConnectionWADTO_I = UpdateConnectionWAParamsDTO_I &
  UpdateConnectionWABodyDTO_I;
