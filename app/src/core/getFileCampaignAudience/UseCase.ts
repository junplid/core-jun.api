import { GetFileCampaignAudienceDTO_I } from "./DTO";
import { prisma } from "../../adapters/Prisma/client";
import XLSX from "xlsx";
import { resolve } from "path";
import { existsSync, readFileSync } from "fs-extra";
import { GetConfigAppDTO_I } from "../getConfigApp/DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";

type Data = {
  [key: string]: string | number | undefined;
};

export class GetFileCampaignAudienceUseCase {
  constructor() {}

  async run(dto: GetFileCampaignAudienceDTO_I) {
    const audience = await prisma.audience.findFirst({
      where: { id: dto.id, accountId: dto.accountId },
      select: {
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

    const data: Data[] = audience.ContactsWAOnAccountOnAudience.map((lead) => {
      const tagsList =
        lead.ContactsWAOnAccount.TagOnBusinessOnContactsWAOnAccount.map(
          (s) => s.TagOnBusiness.Tag.name
        );
      let tags: string | undefined = undefined;
      if (tagsList.length) {
        if (tagsList.length === 1) tags = tagsList.toString();
        if (tagsList.length > 1) tags = `[${tagsList.join(", ")}]`;
      }

      const vars: Data =
        lead.ContactsWAOnAccount.ContactsWAOnAccountVariableOnBusiness.reduce(
          (ac, cr) => {
            return {
              ...ac,
              [cr.VariableOnBusiness.Variable.name]:
                cr.value || cr.VariableOnBusiness.Variable.value || "",
            };
          },
          {} as Data
        );

      return {
        Nome: lead.ContactsWAOnAccount.name,
        Tag: tags,
        Telefone: lead.ContactsWAOnAccount.ContactsWA.completeNumber,
        ...vars,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const file = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    const pathConfig = resolve(__dirname, "../../config/index.json");
    const pathConfigExist = existsSync(pathConfig);

    let namePlataform = "PLATAFORMA";
    if (pathConfigExist) {
      const config = readFileSync(pathConfig, { encoding: "utf-8" });
      const configParsed = JSON.parse(config) as GetConfigAppDTO_I;

      if (configParsed["name"])
        namePlataform = configParsed["name"].toLowerCase();
    }

    return {
      message: "OK!",
      status: 200,
      file,
      audienceName: audience.name,
      namePlataform,
    };
  }
}
