import {
  WAPrivacyGroupAddValue,
  WAPrivacyOnlineValue,
  WAPrivacyValue,
  WAReadReceiptsValue,
} from "baileys";

export interface IDataUpdate {
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: WAPrivacyValue;
  onlinePrivacy?: WAPrivacyOnlineValue;
  imgPerfilPrivacy?: WAPrivacyValue;
  statusPrivacy?: WAPrivacyValue;
  groupsAddPrivacy?: WAPrivacyGroupAddValue;
  readReceiptsPrivacy?: WAReadReceiptsValue;
}

export interface UpdateConnectionWAUserRepository_I {
  update(
    where: { id: number; accountId: number },
    data: IDataUpdate
  ): Promise<void>;
  fetchExist(props: {
    id: number;
    accountId: number;
  }): Promise<{ number: string | null } | null>;
  updateNumber(id: number, number: string): Promise<void>;
}
