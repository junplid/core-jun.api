import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendVideosData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendVideo } from "../../../adapters/Baileys/modules/sendVideo";
import { readFileSync } from "fs-extra";
import { lookup } from "mime-types";
import { resolve } from "path";
import { sendMetaMediaOptimized } from "../../../services/meta/modules/sendMidiaMessage";
import { isWithin24Hours } from "../../../services/meta/modules/checkWindowDay";

interface PropsNodeSendVideos {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;
  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };

  data: NodeSendVideosData;
  accountId: number;
  ticketProtocol?: string;
  nodeId: string;
  action: { onErrorClient?(): void };
  flowStateId: number;
}

export const NodeSendVideos = (props: PropsNodeSendVideos): Promise<void> => {
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
            const mimetype = lookup(urlStatic);
            const msg = await SendVideo({
              connectionId: props.connectionId,
              toNumber: props.lead_id,
              video: readFileSync(urlStatic),
              caption,
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
              type: "video",
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
              type: "video",
              fileName: e.fileName,
              message: "",
              messageKey: msgkey,
              caption,
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
        select: { fileName: true, attachment_id: true },
      });
      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        const mimetype = lookup(urlStatic);
        try {
          let msgkey: string | null = null;

          if (props.external_adapter.type === "baileys") {
            const msg = await SendVideo({
              connectionId: props.connectionId,
              toNumber: props.lead_id,
              video: readFileSync(urlStatic),
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
              type: "video",
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
              type: "video",
              fileName: e.fileName,
              message: "",
              messageKey: msgkey,
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
