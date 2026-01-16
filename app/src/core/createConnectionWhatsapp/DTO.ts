import { TypeConnetion } from "@prisma/client";
import {
  WAPrivacyOnlineValue,
  WAPrivacyValue,
  WAReadReceiptsValue,
  WAPrivacyGroupAddValue,
} from "baileys";

export interface CreateConnectionWADTO_I {
  name: string;
  description?: string;
  accountId: number;
  businessId: number;
  type: TypeConnetion;
  profileName?: string;
  profileStatus?: string;
  lastSeenPrivacy?: WAPrivacyValue;
  onlinePrivacy?: WAPrivacyOnlineValue;
  imgPerfilPrivacy?: WAPrivacyValue;
  statusPrivacy?: WAPrivacyValue;
  groupsAddPrivacy?: WAPrivacyGroupAddValue;
  readReceiptsPrivacy?: WAReadReceiptsValue;
  fileNameImage?: string;
  agentId?: number;
}
