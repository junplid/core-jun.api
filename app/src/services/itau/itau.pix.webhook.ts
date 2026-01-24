import { Request, Response } from "express";
import { prisma } from "../../adapters/Prisma/client";

export async function itauPixWebhook(req: Request, res: Response) {
  const eventos = req.body.pix;

  for (const evento of eventos) {
    const txid = evento.txid;
    const e2eId = evento.endToEndId;

    await prisma.charges.update({
      where: { txid: txid },
      data: {
        paid_at: new Date(evento.horario),
        e2e_id: e2eId,
        status: "approved",
      },
    });
  }

  res.status(200).send();
}
