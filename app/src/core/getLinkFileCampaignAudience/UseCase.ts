import { GetLinkFileCampaignAudienceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import { createTokenAuth } from "../../helpers/authToken";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs-extra";
import { GetConfigAppDTO_I } from "../getConfigApp/DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

export class GetLinkFileCampaignAudienceUseCase {
  constructor() {}

  async run(dto: GetLinkFileCampaignAudienceDTO_I) {
    const audience = await prisma.audience.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      select: {
        Account: { select: { hash: true } },
        name: true,
        // seria bom anexar de alguma forma essa informações no documento!
        // createAt: true,
        // updateAt: true,
        // TagOnBusinessOnAudience: {
        //   select: {TagOnBusiness: {select: {Tag: {select: {name: true}}}}}
        // },
        // AudienceOnBusiness: {
        //   select: {Business: {select: {name :true}}},
        // },
        ContactsWAOnAccountOnAudience: {
          select: {
            ContactsWAOnAccount: {
              select: {
                name: true,
                TagOnBusinessOnContactsWAOnAccount: {
                  select: {
                    TagOnBusiness: {
                      select: { Tag: { select: { name: true } } },
                    },
                  },
                },
                ContactsWAOnAccountVariableOnBusiness: {
                  select: {
                    value: true,
                    VariableOnBusiness: {
                      select: {
                        Variable: { select: { name: true, value: true } },
                      },
                    },
                  },
                },
                ContactsWA: { select: { completeNumber: true } },
              },
            },
          },
        },
      },
    });

    if (!audience) {
      throw new ErrorResponse(400).toast({
        title: `Público não foi encontrado`,
        type: "error",
      });
    }

    const token = await createTokenAuth(
      { type: "api-export", hash: audience.Account.hash, ...dto },
      "secret123"
    );

    let url = "http://localhost:4000";

    const pathConfig = resolve(__dirname, "../../config/index.json");
    const pathConfigExist = existsSync(pathConfig);
    if (pathConfigExist) {
      const config = readFileSync(pathConfig, { encoding: "utf-8" });
      const configParsed = JSON.parse(config) as GetConfigAppDTO_I;

      if (configParsed["url-plataform-adm"]) {
        url = configParsed["url-plataform-adm"] + ":4000";
      }
    }

    const link = `${url}/api/v1/access/campaign-audience/export/download?token=${token}`;

    return { message: "OK!", status: 200, link };
  }
}
