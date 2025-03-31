import { File } from "buffer";

export interface GetConfigAppDTO_I {
  name?: string;
  fileName?: File;
  labelFooter?: string;
  "url-plataform-adm"?: string;
  "url-plataform-ah"?: string;
  rootId: number;
}
