import { WASocket } from "baileys";
import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendImagesData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendImage } from "../../../adapters/Baileys/modules/sendImage";
import { resolve } from "path";

interface PropsNodeSendImages {
  numberLead: string;
  botWA: WASocket;
  contactsWAOnAccountId: number;
  connectionWAId: number;
  data: NodeSendImagesData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
  flowStateId: number;
}

export const NodeSendImages = (props: PropsNodeSendImages): Promise<void> => {
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
          const msg = await SendImage({
            connectionId: props.connectionWAId,
            url: urlStatic,
            toNumber: props.numberLead,
            caption,
          });
          if (msg) {
            await prisma.messages.create({
              data: {
                by: "bot",
                type: "image",
                fileName: e.fileName,
                message: "",
                caption,
                flowStateId: props.flowStateId,
              },
            });
          }
        } catch (error) {
          console.error("Error sending image:", error);
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
        try {
          const msg = await SendImage({
            connectionId: props.connectionWAId,
            url: urlStatic,
            toNumber: props.numberLead,
          });
          if (msg) {
            await prisma.messages.create({
              data: {
                by: "bot",
                type: "image",
                fileName: e.fileName,
                message: "",
                flowStateId: props.flowStateId,
              },
            });
          }
        } catch (error) {
          console.error("Error sending image:", error);

          return props.action.onErrorClient?.();
        }
      }
    }
    return res();
  });
};
