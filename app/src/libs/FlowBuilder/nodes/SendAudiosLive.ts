import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendAudiosLiveData } from "../Payload";
import { lookup } from "mime-types";
import { SendAudio } from "../../../adapters/Baileys/modules/sendAudio";
import { resolve } from "path";

interface PropsNodeSendAudiosLive {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  data: NodeSendAudiosLiveData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
}

export const NodeSendAudiosLive = (
  props: PropsNodeSendAudiosLive
): Promise<void> => {
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
        select: { fileName: true, originalName: true },
      });

      if (e) {
        const urlStatic = `${path}/${e.fileName}`;

        try {
          const mimetype = lookup(urlStatic);
          await SendAudio({
            connectionId: props.connectionWAId,
            mimetype: mimetype || undefined,
            toNumber: props.numberLead,
            urlStatic,
            ptt: true,
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
          await SendAudio({
            connectionId: props.connectionWAId,
            mimetype: mimetype || undefined,
            toNumber: props.numberLead,
            urlStatic,
            ptt: true,
          });
        } catch (error) {
          return props.action.onErrorClient?.();
        }
      }
    }
    return res();
  });
};
