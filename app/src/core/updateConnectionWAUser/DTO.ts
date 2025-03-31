import {
  WAPrivacyOnlineValue,
  WAPrivacyValue,
  WAReadReceiptsValue,
  WAPrivacyGroupAddValue,
} from "baileys";

export interface UpdateConnectionWAUserBodyDTO_I {
  accountId: number;
}

export interface UpdateConnectionWAUserParamsDTO_I {
  id: number;
}

export interface UpdateConnectionWAUserQueryDTO_I {
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: WAPrivacyValue;
  onlinePrivacy?: WAPrivacyOnlineValue;
  imgPerfilPrivacy?: WAPrivacyValue;
  statusPrivacy?: WAPrivacyValue;
  groupsAddPrivacy?: WAPrivacyGroupAddValue;
  readReceiptsPrivacy?: WAReadReceiptsValue;
}

export type UpdateConnectionWAUserDTO_I = UpdateConnectionWAUserParamsDTO_I &
  UpdateConnectionWAUserBodyDTO_I &
  UpdateConnectionWAUserQueryDTO_I;
