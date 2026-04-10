import { NodeNotifyWAData } from "../Payload";
import { validatePhoneNumber } from "../../../helpers/validatePhoneNumber";
import { prisma } from "../../../adapters/Prisma/client";
import { resolveJid } from "../../../utils/resolveJid";
import { NodeMessage } from "./Message";
import { SendMessageText } from "../../../adapters/Baileys/modules/sendMessage";
import { resolveTextVariables } from "../utils/ResolveTextVariables";
import { webSocketEmitToRoom } from "../../../infra/websocket";
import { resolveHourAndMinute } from "../../../utils/resolveHour:mm";

type PropsNodeNotifyWA =
  | {
      lead_id: string;
      contactAccountId: number;
      connectionId: number;
      external_adapter:
        | { type: "baileys" }
        | { type: "instagram"; page_token: string };

      data: NodeNotifyWAData;
      accountId: number;
      businessName: string;
      ticketProtocol?: string;
      nodeId: string;
      flowStateId: number;
      flowId: string;
      chatbotId?: number;
      action: { onErrorClient?(): void };
      mode: "prod";
    }
  | {
      mode: "testing";
      token_modal_chat_template: string;
      data: NodeNotifyWAData;
      nodeId: string;
      contactAccountId: number;
      accountId: number;
    };

export const NodeNotifyWA = async (props: PropsNodeNotifyWA): Promise<void> => {
  let dataText = "";

  if (props.mode === "prod") {
    dataText = await resolveTextVariables({
      accountId: props.accountId,
      text: props.data.text || "",
      contactsWAOnAccountId: props.contactAccountId,
      nodeId: props.nodeId,
      numberLead: props.lead_id,
    });
  }

  const listContactWAAccountId: { id: number; lead_id: string }[] = [];
  if (props.data.numbersWithTagIds.length) {
    const listnumbers = await prisma.contactsWAOnAccount.findMany({
      where: {
        ...(props.data.numbersWithTagIds?.length
          ? {
              AND: [
                {
                  TagOnContactsWAOnAccount: {
                    some: { tagId: { in: props.data.numbersWithTagIds } },
                  },
                },
                {
                  TagOnContactsWAOnAccount: {
                    some: { tagId: { notIn: props.data.ignoreTagIds } },
                  },
                },
              ],
            }
          : {
              TagOnContactsWAOnAccount: {
                some: { tagId: { in: props.data.numbersWithTagIds } },
              },
            }),
        accountId: props.accountId,
      },
      select: { id: true, ContactsWA: { select: { completeNumber: true } } },
    });
    listContactWAAccountId.push(
      ...listnumbers.map((s) => ({
        id: s.id,
        lead_id: s.ContactsWA.completeNumber,
      })),
    );
  }

  for await (const { number } of props.data.numbers) {
    const numberresolve = await resolveTextVariables({
      accountId: props.accountId,
      text: number || "",
      contactsWAOnAccountId: props.contactAccountId,
      nodeId: props.nodeId,
      numberLead: props.mode === "prod" ? props.lead_id : undefined,
    });
    const newNumber = validatePhoneNumber(numberresolve);
    let contactsWAOnAccountId: number | null = null;
    let lead_id: string | null = null;

    if (newNumber) {
      if (props.mode === "prod") {
        const valid = await resolveJid(props.connectionId, newNumber, true);
        if (!valid) continue;
        lead_id = valid.completeNumber;
        if (props.data.tagIds?.length) {
          const contactAccount = await prisma.contactsWAOnAccount.findFirst({
            where: {
              accountId: props.accountId,
              contactWAId: valid.contactId,
            },
            select: {
              id: true,
              TagOnContactsWAOnAccount: { select: { tagId: true } },
            },
          });
          if (!contactAccount?.id) {
            const { id } = await prisma.contactsWAOnAccount.create({
              data: {
                name: "<unknown>",
                accountId: props.accountId,
                contactWAId: valid.contactId,
              },
              select: { id: true },
            });
            contactsWAOnAccountId = id;
          } else {
            const isTag = contactAccount.TagOnContactsWAOnAccount.some(
              ({ tagId }) => props.data.ignoreTagIds.includes(tagId),
            );
            if (isTag) continue;
            contactsWAOnAccountId = contactAccount.id;
          }
          for await (const tagId of props.data.tagIds) {
            const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
              where: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
            });
            if (!isExist) {
              await prisma.tagOnContactsWAOnAccount.create({
                data: { contactsWAOnAccountId: contactsWAOnAccountId, tagId },
              });
            }
          }
        }
      } else {
        for await (const tagId of props.data.tagIds) {
          const isExist = await prisma.tag.findFirst({
            where: { id: tagId },
            select: { name: true },
          });
          if (isExist) {
            await SendMessageText({
              mode: "testing",
              accountId: props.accountId,
              role: "system",
              text: `Tag: ${isExist?.name} adicionada a ${newNumber}`,
              token_modal_chat_template: props.token_modal_chat_template,
            });
            new Promise((s) => setTimeout(s, 300));
          }
        }
      }

      try {
        if (props.mode === "prod") {
          if (contactsWAOnAccountId && lead_id) {
            await NodeMessage({
              accountId: props.accountId,
              action: props.action,
              connectionId: props.connectionId,
              sendBy: "bot",
              contactAccountId: contactsWAOnAccountId,
              data: {
                messages: [
                  {
                    key: "1",
                    text: dataText,
                    interval: undefined,
                  },
                ],
              },
              external_adapter: props.external_adapter,
              flowStateId: props.flowStateId,
              lead_id,
              nodeId: props.nodeId,
              mode: "prod",
            });
          }
        } else {
          if (contactsWAOnAccountId && lead_id) {
            await NodeMessage({
              accountId: props.accountId,
              sendBy: "bot",
              contactAccountId: contactsWAOnAccountId,
              data: {
                messages: [
                  {
                    key: "1",
                    text: dataText,
                    interval: undefined,
                  },
                ],
              },
              token_modal_chat_template: props.token_modal_chat_template,
              lead_id,
              nodeId: props.nodeId,
              mode: "testing",
            });
          }
        }
        continue;
      } catch (error) {
        continue;
      }
    }
  }

  for await (const idContact of listContactWAAccountId) {
    if (props.mode === "prod") {
      if (props.data.tagIds?.length) {
        for await (const tagId of props.data.tagIds) {
          const isExist = await prisma.tagOnContactsWAOnAccount.findFirst({
            where: { contactsWAOnAccountId: idContact.id, tagId },
          });
          if (!isExist) {
            await prisma.tagOnContactsWAOnAccount.create({
              data: { contactsWAOnAccountId: idContact.id, tagId },
            });
          }
        }
      }
    } else {
      for await (const tagId of props.data.tagIds) {
        const isExist = await prisma.tag.findFirst({
          where: { id: tagId },
          select: { name: true },
        });
        if (isExist) {
          await SendMessageText({
            mode: "testing",
            accountId: props.accountId,
            role: "system",
            text: `Tag: ${isExist?.name} adicionada`,
            token_modal_chat_template: props.token_modal_chat_template,
          });
          new Promise((s) => setTimeout(s, 300));
        }
      }
    }

    try {
      if (props.mode === "prod") {
        let currentIndexNodeLead = await prisma.flowState.findFirst({
          where: {
            connectionWAId: props.connectionId,
            contactsWAOnAccountId: idContact.id,
            isFinish: false,
          },
          select: { id: true },
        });
        if (!currentIndexNodeLead) {
          currentIndexNodeLead = await prisma.flowState.create({
            data: {
              connectionWAId: props.connectionId,
              contactsWAOnAccountId: idContact.id,
              indexNode: "0",
              flowId: props.flowId,
              chatbotId: props.chatbotId,
            },
            select: {
              id: true,
            },
          });
          webSocketEmitToRoom()
            .account(props.accountId)
            .dashboard.dashboard_services({
              delta: +1,
              hour: resolveHourAndMinute(),
            });
        }

        dataText = await resolveTextVariables(
          {
            accountId: props.accountId,
            text: dataText,
            contactsWAOnAccountId: idContact.id,
            nodeId: props.nodeId,
            numberLead: idContact.lead_id,
          },
          [
            {
              name: "JUN_NUMERO_LEAD_WHATSAPP_NOTIFY",
              value: idContact.lead_id,
            },
            {
              name: "JUN_FSID_NOTIFY",
              value: String(currentIndexNodeLead.id),
            },
          ],
        );

        await NodeMessage({
          accountId: props.accountId,
          action: props.action,
          connectionId: props.connectionId,
          sendBy: "bot",
          contactAccountId: idContact.id,
          data: {
            messages: [
              {
                key: "1",
                text: dataText,
                interval: undefined,
              },
            ],
          },
          external_adapter: props.external_adapter,
          flowStateId: currentIndexNodeLead.id,
          lead_id: idContact.lead_id,
          nodeId: props.nodeId,
          mode: "prod",
        });
      } else {
        await NodeMessage({
          accountId: props.accountId,
          sendBy: "bot",
          contactAccountId: props.contactAccountId,
          data: {
            messages: [
              {
                key: "1",
                text: dataText || "",
                interval: undefined,
              },
            ],
          },
          token_modal_chat_template: props.token_modal_chat_template,
          lead_id: idContact.lead_id,
          nodeId: props.nodeId,
          mode: "testing",
        });
      }

      continue;
    } catch (error) {
      continue;
    }
  }
};
