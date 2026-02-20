import { Request, Response } from "express";
import { stripe } from "./stripe.client";
import { prisma } from "../../adapters/Prisma/client";
import Stripe from "stripe";
import { NotificationApp } from "../../utils/notificationApp";
import moment from "moment-timezone";
import { TypeSubscriptionStatus } from "@prisma/client";

export async function stripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

    switch (event.type) {
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;

        let accountId: number;
        let statusLocal: TypeSubscriptionStatus | null = null;
        try {
          const { subscriptionStatus } =
            await prisma.accountSubscription.findFirstOrThrow({
              where: { customerId: sub.customer as string },
              select: { subscriptionStatus: true },
            });
          if (subscriptionStatus) statusLocal = subscriptionStatus;
          const acsb = await prisma.accountSubscription.update({
            where: { customerId: sub.customer as string },
            data: {
              subscriptionStatus: sub.status,
              stripeSubscriptionId:
                event.type === "customer.subscription.created"
                  ? sub.id
                  : undefined,
            },
            select: { accountId: true },
          });
          accountId = acsb.accountId;
        } catch (error) {
          throw error;
        }

        if (statusLocal !== sub.status) {
          if (sub.status !== "trialing" && sub.status !== "active") {
            // cancelar atividade da conta.
            // no frontend deve ser levado para o local de
            if (sub.status === "past_due") {
              await NotificationApp({
                accountId,
                title_txt: "Assinatura vencida ⚠️",
                title_html: "Assinatura vencida ⚠️",
                tag: `acsb-${accountId}`,
                body_txt:
                  "Recursos e ativos da conta foram temporariamente suspensos.",
                body_html: `<span className="font-medium text-sm line-clamp-1">Recursos e ativos da conta foram temporariamente suspensos.</span>`,
              });
            }
          } else {
            // reativar atividade da conta.
            // no frontend deve ser levado para o dashboard
            await NotificationApp({
              accountId,
              title_txt: "Sua assinatura está de volta ⚡",
              title_html: "Sua assinatura está de volta ⚡",
              tag: `acsb-${accountId}`,
              body_txt: "Seu acesso foi reativado com sucesso.",
              body_html: `<span className="font-medium text-sm line-clamp-1">Seu acesso foi reativado com sucesso.</span>`,
            });
          }
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;

        if (invoice.billing_reason === "subscription_create") {
          let accountId: number;
          try {
            const acsb = await prisma.accountSubscription.findFirstOrThrow({
              where: { customerId: invoice.customer as string },
              select: { accountId: true },
            });
            accountId = acsb.accountId;
          } catch (error) {
            throw error;
          }

          await new Promise((s) => setTimeout(s, 2400));
          await NotificationApp({
            accountId,
            title_txt: "Assinatura confirmada 🚀",
            title_html: "Assinatura confirmada 🚀",
            tag: `acsb-${accountId}`,
            body_txt: "Seu acesso aos recursos foi liberado.",
            body_html: `<span className="font-medium text-sm line-clamp-1">Seu acesso aos recursos foi liberado.</span>\n<span className="text-xs font-light text-white/60">Valido até: ${moment.unix(invoice.period_end).format("DD/MM/YYYY")}</span>`,
          });
        }
      }

      default:
        break;
    }

    res.json({ received: true });
  } catch (err: any) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
