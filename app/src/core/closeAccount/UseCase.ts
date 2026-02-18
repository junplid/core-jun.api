import { CloseAccountDTO_I } from "./DTO";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { prisma } from "../../adapters/Prisma/client";
import { compare } from "bcrypt";
import { ModelFlows } from "../../adapters/mongo/models/flows";
import { mongo } from "../../adapters/mongo/connection";
import { resolve } from "path";
import { readFile, writeFileSync } from "fs-extra";
import {
  CacheSessionsBaileysWA,
  sessionsBaileysWA,
} from "../../adapters/Baileys";
import {
  metaUnsubscribeApps,
  revokeUserPermissions,
} from "../../services/meta/meta.service";
import { decrypte } from "../../libs/encryption";

let pathConnections = "";
if (process.env?.NODE_ENV === "production") {
  pathConnections = resolve(__dirname, `../bin/connections.json`);
} else {
  pathConnections = resolve(__dirname, `../../../bin/connections.json`);
}

export class CloseAccountUseCase {
  constructor() {}

  async run({ accountId, password }: CloseAccountDTO_I) {
    const account = await prisma.account.findFirst({
      where: { id: accountId },
      select: {
        password: true,
        Business: {
          select: {
            ConnectionWA: { select: { id: true } },
            ConnectionIg: { select: { credentials: true, page_id: true } },
          },
        },
      },
    });
    if (!account) throw new ErrorResponse(401);

    if (!(await compare(password, account.password))) {
      throw new ErrorResponse(400).input({
        text: `Senha atual inválida.`,
        path: "current",
      });
    }

    const listConnectionsIg = account.Business.map(
      (s) => s.ConnectionIg,
    ).flat();

    await Promise.all(
      listConnectionsIg.map(async (ig) => {
        try {
          const payload = decrypte(ig.credentials);
          await metaUnsubscribeApps({
            page_id: ig.page_id,
            account_access_token: payload.account_access_token,
          });
          await revokeUserPermissions({
            user_access_token: payload.account_access_token,
          });
        } catch (error) {
          await prisma.logSystem.create({
            data: {
              name: "error_delete_data_meta_account",
              description: JSON.stringify(error, null, 2),
            },
          });
        }
      }),
    );

    await prisma.messages.deleteMany({
      where: { Tickets: { accountId } },
    });

    await prisma.account.delete({ where: { id: accountId } });
    mongo();
    await ModelFlows.deleteMany({ accountId });

    const listConnectionsId = account.Business.map((s) =>
      s.ConnectionWA.map((c) => c.id),
    ).flat();
    if (listConnectionsId.length) {
      listConnectionsId.forEach((cId) => {
        const client = sessionsBaileysWA.get(cId);
        if (client) {
          client?.end(
            // @ts-expect-error
            `Force disconection: ${dto.id} - ${connection.name} - ${connection.type}`,
          );
        }
      });

      await new Promise<void>((res, rej) =>
        readFile(pathConnections, (err, file) => {
          if (err) return rej("Error na leitura no arquivo de conexões");
          const listConnections: CacheSessionsBaileysWA[] = JSON.parse(
            file.toString(),
          );
          const nextList = JSON.stringify(
            listConnections.filter(
              ({ connectionWhatsId }) =>
                !listConnectionsId.includes(connectionWhatsId),
            ),
          );
          writeFileSync(pathConnections, nextList);
          return res();
        }),
      );
    }

    return { status: 200, message: "OK" };
  }
}
