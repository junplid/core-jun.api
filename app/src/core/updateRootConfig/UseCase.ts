import { resolve } from "path";
import { UpdateRootConfigDTO_I } from "./DTO";
import { readFile, writeFile } from "fs-extra";

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

    return { message: "OK!", status: 201 };
  }
}
