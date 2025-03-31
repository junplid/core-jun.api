import { resolve } from "path";
import { UpdateRootConfigDTO_I } from "./DTO";
import { readFile, writeFile } from "fs-extra";
import { ApiAssas } from "../../services/Assas/api";

interface RootJSON {
  "token-asaas": string;
  "endpoint-asaas": string;
  host?: string;
  port?: number;
  secure?: boolean;
  authUser?: string;
  authPass?: string;
  email?: string;
}

export class UpdateRootConfigUseCase {
  constructor() {}

  async run({ rootId, ...dto }: UpdateRootConfigDTO_I) {
    const path = resolve(__dirname, "../../config/root.json");
    const rootJSON: RootJSON = JSON.parse((await readFile(path)).toString());
    writeFile(path, JSON.stringify(Object.assign(rootJSON, dto)));

    try {
      if (dto["endpoint-asaas"]) {
        ApiAssas.defaults.url = dto["endpoint-asaas"];
        ApiAssas.defaults.baseURL = dto["endpoint-asaas"];
      }
      if (dto["token-asaas"]) {
        ApiAssas.defaults.headers.common.access_token = dto["token-asaas"];
      }
    } catch (error) {
      console.log(error);
    }

    return { message: "OK!", status: 201 };
  }
}
