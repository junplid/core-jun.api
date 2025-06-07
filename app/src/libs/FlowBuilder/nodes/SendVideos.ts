import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendVideosData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendVideo } from "../../../adapters/Baileys/modules/sendVideo";
import { readFileSync } from "fs-extra";
import { lookup } from "mime-types";

interface PropsNodeSendVideos {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  data: NodeSendVideosData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
}

export const NodeSendVideos = (props: PropsNodeSendVideos): Promise<void> => {
  return new Promise(async (res, rej) => {
    let path = "";
    if (process.env.NODE_ENV === "production") {
      path = "../static/storage";
    } else {
      path = "../../../../static/storage";
    }

    const firstFile = props.data.files.shift();
    if (firstFile) {
      const e = await prisma.storagePaths.findFirst({
        where: { id: firstFile.id, accountId: props.accountId },
        select: { fileName: true, originalName: true },
      });

      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
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
          const mimetype = lookup(urlStatic);
          await SendVideo({
            connectionId: props.connectionWAId,
            toNumber: props.numberLead,
            video: readFileSync(urlStatic),
            caption,
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
          await SendVideo({
            connectionId: props.connectionWAId,
            toNumber: props.numberLead,
            video: readFileSync(urlStatic),
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
