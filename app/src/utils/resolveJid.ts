import { WASocket } from "baileys";
import { prisma } from "../adapters/Prisma/client";

export const resolveJid = async (
  sock: WASocket,
  rawNumber: string,
  pre: boolean
): Promise<
  { jid: string; completeNumber: string; contactId: number } | undefined
> => {
  const digits = rawNumber.replace(/\D/g, "");
  const ccFixed = digits.startsWith("55") ? digits : `55${digits}`;

  const ddd = ccFixed.slice(2, 4);
  const local = ccFixed.slice(4);

  const candidates: string[] = [];

  if (local.length === 9) candidates.push(ccFixed);
  if (local.length === 8) {
    candidates.push(ccFixed);
    candidates.push(`55${ddd}9${local}`);
  }

  if (pre) {
    const getN = await prisma.contactsWA.findFirst({
      where: { completeNumber: { in: candidates } },
      select: { id: true, completeNumber: true },
    });
    if (getN?.id) {
      return {
        jid: getN.completeNumber + `@s.whatsapp.net`,
        contactId: getN.id,
        completeNumber: getN.completeNumber,
      };
    }
  }

  const resolve = await sock.onWhatsApp(
    ...candidates.map((c) => `${c}@s.whatsapp.net`)
  );
  for (const c of resolve || []) {
    if (c.exists) {
      const completeNumber = c.jid.split("@")[0];
      const { id } = await prisma.contactsWA.create({
        data: { completeNumber: completeNumber },
        select: { id: true },
      });
      return { jid: c.jid, completeNumber: c.jid.split("@")[0], contactId: id };
    }
  }
  return;
};
