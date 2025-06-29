import { Request, Response } from "express";
import crypto from "crypto";

export const webhookMercadopago = (req: Request, res: Response) => {
  try {
    const xSignature = req.header("x-signature");
    const xRequestId = req.header("x-request-id");
    if (!xSignature || !xRequestId) {
      return res.status(400).send("Headers missing");
    }

    const parts = xSignature.split(",");
    let ts: string | undefined;
    let signatureHash: string | undefined;
    for (const part of parts) {
      const [key, val] = part.trim().split("=");
      if (key === "ts") ts = val;
      else if (key === "v1") signatureHash = val;
    }
    if (!ts || !signatureHash) {
      return res.status(400).send("Invalid x-signature format");
    }

    const payload = req.body;
    if (!payload?.data?.id) {
      return res.status(400).send("Missing payload.data.id");
    }

    const manifest = `id:${payload.id};request-id:${xRequestId};ts:${ts};`;

    const secret = process.env.MP_WEBHOOK_SECRET!;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const computedHash = hmac.digest("hex");

    const received = Buffer.from(signatureHash, "hex");
    const expected = Buffer.from(computedHash, "hex");
    if (
      received.length !== expected.length ||
      !crypto.timingSafeEqual(received, expected)
    ) {
      return res.status(401).send("Invalid signature");
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const tsSec = parseInt(ts, 10);
    const tolerance = 5 * 60; // 5 minutos
    if (Math.abs(nowSec - tsSec) > tolerance) {
      return res.status(400).send("Timestamp outside of tolerance");
    }

    console.log(payload);

    return res.status(200).send("OK");
  } catch (err) {
    console.error("Webhook validation error:", err);
    return res.status(500).send("Internal error");
  }
};
