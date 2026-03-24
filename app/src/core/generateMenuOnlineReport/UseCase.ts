import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GenerateMenuOnlineReportDTO_I } from "./DTO";
import { genNumCode } from "../../utils/genNumCode";
import { Response } from "express";
import PDFDocument from "pdfkit";
import { gerarRelatorio } from "./gerarpdf";
import moment from "moment-timezone";

const PAYMENT_OPTIONS: { [s: string]: string } = {
  Pix: "PIX",
  Dinheiro: "Dinheiro",
  Crédito: "C Crédito",
  Débito: "C Débito",
};

export class GenerateMenuOnlineReportUseCase {
  constructor() {}

  async run({ uuid, ...rest }: GenerateMenuOnlineReportDTO_I, res: Response) {
    const exist = await prisma.menusOnline.findFirst({
      where: { uuid },
      select: {
        id: true,
        logoImg: true,
        titlePage: true,
        Orders: {
          where: {
            createAt: { gte: new Date(rest.start), lte: new Date(rest.end) },
            deleted: false,
            payment_made: { not: null },
            status: {
              in: ["completed", "confirmed", "delivered", "ready", "on_way"],
            },
          },
          orderBy: { createAt: "asc" },
          select: {
            name: true,
            n_order: true,
            total: true,
            net_total: true,
            sub_total: true,
            payment_method: true,
            data: true,
            createAt: true,
            itens_count: true,
            OrderAdjustments: {
              select: {
                amount: true,
                type: true,
                label: true,
              },
            },
          },
        },
      },
    });

    if (!exist) {
      throw new ErrorResponse(400).container(
        "Cardápio digital não encontrado.",
      );
    }

    const countOrders = exist.Orders.length;
    const totalDeVendas = exist.Orders.reduce((ac, cr) => {
      ac += cr.sub_total?.toNumber() || 0; // total do pedido (sem taxas)
      return ac;
    }, 0);
    const totalTaxasDeEntrega = exist.Orders.reduce((ac, cr) => {
      const total = cr.OrderAdjustments.reduce((ac2, cr2) => {
        if (cr2.label === "Taxa de entrega" && cr2.type === "in") {
          ac += cr2.amount?.toNumber() || 0;
        }
        return ac;
      }, 0);
      ac += total;
      return ac;
    }, 0);
    const totalTaxasPlataforma = exist.Orders.reduce((ac, cr) => {
      const total = cr.OrderAdjustments.reduce((ac2, cr2) => {
        if (cr2.label === "Taxa plataforma" && cr2.type === "out") {
          ac += cr2.amount?.toNumber() || 0;
        }
        return ac;
      }, 0);
      ac += total;
      return ac;
    }, 0);
    const totalBruto = totalDeVendas + totalTaxasDeEntrega;
    const totalLiquido =
      totalDeVendas - totalTaxasDeEntrega - totalTaxasPlataforma;

    const totalPix = exist.Orders.reduce(
      (ac, cr) => {
        if (cr.payment_method?.toLowerCase() === "pix") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalDinheiro = exist.Orders.reduce(
      (ac, cr) => {
        if (cr.payment_method?.toLowerCase() === "Dinheiro") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalDebito = exist.Orders.reduce(
      (ac, cr) => {
        if (cr.payment_method?.toLowerCase() === "Débito") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalCredito = exist.Orders.reduce(
      (ac, cr) => {
        if (cr.payment_method?.toLowerCase() === "Crédito") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );

    const totalQnt =
      totalPix.qnt + totalDinheiro.qnt + totalDebito.qnt + totalCredito.qnt;
    const totalAmount =
      totalPix.amount +
      totalDinheiro.amount +
      totalDebito.amount +
      totalCredito.amount;

    const pedidos = exist.Orders.map((ac) => {
      return {
        code: `${ac.n_order}`,
        name: `${moment(ac.createAt).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm")} ${ac.name}`,
        forma: ac.payment_method
          ? PAYMENT_OPTIONS[ac.payment_method]
          : undefined,
        valorPd: ac.sub_total?.toNumber(),
        txEntr: ac.OrderAdjustments.reduce((ac2, cr2) => {
          if (cr2.label === "Taxa de entrega" && cr2.type === "in") {
            ac2 += cr2.amount?.toNumber() || 0;
          }
          return ac2;
        }, 0),
        txPd: ac.OrderAdjustments.reduce((ac2, cr2) => {
          if (cr2.label === "Taxa plataforma" && cr2.type === "out") {
            ac2 += cr2.amount?.toNumber() || 0;
          }
          return ac2;
        }, 0),
        totalBruto: ac.total?.toNumber(),
        totalLiquido: ac.net_total?.toNumber(),
      };
    });

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);
    // gerarRelatorio(doc, {});
    doc.end();

    try {
      return {
        message: "OK!",
        status: 201,
        filename: ``,
      };
    } catch (error) {
      throw new ErrorResponse(400).container(
        "Error ao tentar gerar relatório.",
      );
    }
  }
}
