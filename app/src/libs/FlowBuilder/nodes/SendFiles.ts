import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendFilesData } from "../Payload";
import { lookup } from "mime-types";
import { SendFile } from "../../../adapters/Baileys/modules/sendFile";
import { readFileSync } from "fs-extra";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { resolve } from "path";
import { sendMetaMediaOptimized } from "../../../services/meta/modules/sendMidiaMessage";
import { isWithin24Hours } from "../../../services/meta/modules/checkWindowDay";

interface PropsNodeSendFiles {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;
  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };

  data: NodeSendFilesData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
  flowStateId: number;
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
        select: { fileName: true, originalName: true, attachment_id: true },
      });

      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        const mimetype = lookup(urlStatic);
        let caption = "";

        if (props.data.caption) {
          caption = await resolveTextVariables({
            accountId: props.accountId,
            contactsWAOnAccountId: props.contactAccountId,
            text: props.data.caption,
            ticketProtocol: props.ticketProtocol,
            numberLead: props.lead_id,
            nodeId: props.nodeId,
          });
        }
        try {
          let msgkey: string | null = null;

          if (props.external_adapter.type === "baileys") {
            const msg = await SendFile({
              connectionId: props.connectionId,
              originalName: e.originalName,
              toNumber: props.lead_id,
              caption,
              document: readFileSync(urlStatic),
              mimetype: mimetype || undefined,
            });
            if (!msg?.key?.id) return props.action.onErrorClient?.();
            msgkey = msg?.key?.id;
          }
          if (props.external_adapter.type === "instagram") {
            const ca = await prisma.contactsWAOnAccount.findFirst({
              where: { id: props.contactAccountId },
              select: { last_interaction: true },
            });
            if (!ca?.last_interaction) {
              return props.action.onErrorClient?.();
            }
            if (!isWithin24Hours(ca.last_interaction)) {
              return props.action.onErrorClient?.();
            }
            const { attachment_id, message_id } = await sendMetaMediaOptimized({
              page_token: props.external_adapter.page_token,
              recipient_id: props.lead_id,
              type: "file",
              url: urlStatic,
              attachmentId: e.attachment_id || undefined,
            });
            if (!e.attachment_id) {
              prisma.storagePaths
                .update({
                  where: { id: firstFile.id },
                  data: { attachment_id },
                })
                .then(() => undefined)
                .catch((err) => undefined);
            }
            msgkey = message_id;
          }

          await prisma.messages.create({
            data: {
              by: "bot",
              type: "file",
              fileName: e.fileName,
              fileNameOriginal: e.originalName,
              message: "",
              caption,
              messageKey: msgkey,
              flowStateId: props.flowStateId,
            },
          });
        } catch (error) {
          return props.action.onErrorClient?.();
        }
      }
    }

    for await (const file of props.data.files) {
      const e = await prisma.storagePaths.findFirst({
        where: { id: file.id, accountId: props.accountId },
        select: { fileName: true, originalName: true, attachment_id: true },
      });
      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        const mimetype = lookup(urlStatic);
        try {
          let msgkey: string | null = null;
          if (props.external_adapter.type === "baileys") {
            const msg = await SendFile({
              connectionId: props.connectionId,
              originalName: e.originalName,
              toNumber: props.lead_id,
              document: readFileSync(urlStatic),
              mimetype: mimetype || undefined,
            });
            if (!msg?.key?.id) return props.action.onErrorClient?.();
            msgkey = msg?.key?.id;
          }

          if (props.external_adapter.type === "instagram") {
            const ca = await prisma.contactsWAOnAccount.findFirst({
              where: { id: props.contactAccountId },
              select: { last_interaction: true },
            });
            if (!ca?.last_interaction) {
              return props.action.onErrorClient?.();
            }
            if (!isWithin24Hours(ca.last_interaction)) {
              return props.action.onErrorClient?.();
            }
            const { attachment_id, message_id } = await sendMetaMediaOptimized({
              page_token: props.external_adapter.page_token,
              recipient_id: props.lead_id,
              type: "file",
              url: urlStatic,
              attachmentId: e.attachment_id || undefined,
            });
            if (!e.attachment_id) {
              prisma.storagePaths
                .update({
                  where: { id: file.id },
                  data: { attachment_id },
                })
                .then(() => undefined)
                .catch((err) => undefined);
            }
            msgkey = message_id;
          }

          await prisma.messages.create({
            data: {
              by: "bot",
              type: "file",
              fileName: e.fileName,
              messageKey: msgkey,
              fileNameOriginal: e.originalName,
              message: "",
              flowStateId: props.flowStateId,
            },
          });
        } catch (error) {
          return props.action.onErrorClient?.();
        }
      }
    }
    return res();
  });
};
