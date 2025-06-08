import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendFilesData } from "../Payload";
import { lookup } from "mime-types";
import { SendFile } from "../../../adapters/Baileys/modules/sendFile";
import { readFileSync } from "fs-extra";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { resolve } from "path";

interface PropsNodeSendFiles {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  data: NodeSendFilesData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
}

export const NodeSendFiles = (props: PropsNodeSendFiles): Promise<void> => {
  return new Promise(async (res, rej) => {
    let path = "";
    if (process.env.NODE_ENV === "production") {
      path = resolve(__dirname, "../static/storage");
    } else {
      path = resolve(__dirname, "../../../../static/storage");
    }

    const firstFile = props.data.files.shift();
    if (firstFile) {
      const e = await prisma.storagePaths.findFirst({
        where: { id: firstFile.id, accountId: props.accountId },
        select: { fileName: true },
      });

      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        const mimetype = lookup(urlStatic);
        let caption = "";

        if (props.data.caption) {
          caption = await resolveTextVariables({
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactsWAOnAccountId,
            text: props.data.caption,
            ticketProtocol: props.ticketProtocol,
            numberLead: props.numberLead,
            nodeId: props.nodeId,
          });
        }
        try {
          await SendFile({
            connectionId: props.connectionWAId,
            originalName: firstFile.originalName,
            toNumber: props.numberLead,
            caption,
            document: readFileSync(urlStatic),
            mimetype: mimetype || undefined,
          });
        } catch (error) {
          return props.action.onErrorClient?.();
        }
      }
    }

    for await (const file of props.data.files) {
      const e = await prisma.storagePaths.findFirst({
        where: { id: file.id, accountId: props.accountId },
        select: { fileName: true },
      });
      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        const mimetype = lookup(urlStatic);
        try {
          await SendFile({
            connectionId: props.connectionWAId,
            originalName: file.originalName,
            toNumber: props.numberLead,
            document: readFileSync(urlStatic),
            mimetype: mimetype || undefined,
          });
        } catch (error) {
          return props.action.onErrorClient?.();
        }
      }
    }
    return res();
  });
};
