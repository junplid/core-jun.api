import { prisma } from "../../../adapters/Prisma/client";
import { NodeSendImagesData } from "../Payload";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { SendImage } from "../../../adapters/Baileys/modules/sendImage";
import { resolve } from "path";
import { sendMetaMediaOptimized } from "../../../services/meta/modules/sendMidiaMessage";
import { isWithin24Hours } from "../../../services/meta/modules/checkWindowDay";

interface PropsNodeSendImages {
  lead_id: string;
  contactAccountId: number;
  connectionId: number;
  external_adapter:
    | { type: "baileys" }
    | { type: "instagram"; page_token: string };

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

    const files = structuredClone(props.data.files);
    const firstFile = files.shift();
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
            const msg = await SendImage({
              connectionId: props.connectionId,
              url: urlStatic,
              toNumber: props.lead_id,
              caption,
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
              type: "image",
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
              type: "image",
              fileName: e.fileName,
              message: "",
              messageKey: msgkey,
              caption,
              flowStateId: props.flowStateId,
            },
          });
        } catch (error) {
          console.error("Error sending image:", error);
          return props.action.onErrorClient?.();
        }
      }
    }

    for await (const file of files) {
      const e = await prisma.storagePaths.findFirst({
        where: { id: file.id, accountId: props.accountId },
        select: { fileName: true, attachment_id: true },
      });
      if (e) {
        const urlStatic = `${path}/${e.fileName}`;
        try {
          let msgkey: string | null = null;

          if (props.external_adapter.type === "baileys") {
            const msg = await SendImage({
              connectionId: props.connectionId,
              url: urlStatic,
              toNumber: props.lead_id,
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
              type: "image",
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
              type: "image",
              fileName: e.fileName,
              message: "",
              messageKey: msgkey,
              flowStateId: props.flowStateId,
            },
          });
        } catch (error) {
          console.error("Error sending image:", error);

          return props.action.onErrorClient?.();
        }
      }
    }
    return res();
  });
};
