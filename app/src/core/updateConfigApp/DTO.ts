import { File } from "buffer";

export interface UpdateConfigAppDTO_I {
  name?: string;
  fileName?: File;
  labelFooter?: string;
  "url-plataform-adm"?: string;
  "url-plataform-ah"?: string;
  labelMenuLateral?: string;
  labelBarraSuperior?: string;
  rootId: number;
}
