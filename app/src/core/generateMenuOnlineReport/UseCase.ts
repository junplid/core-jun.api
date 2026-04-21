import { prisma } from "../../adapters/Prisma/client";
import { ErrorResponse } from "../../utils/ErrorResponse";
import { GenerateMenuOnlineReportDTO_I } from "./DTO";
import { Response } from "express";
import PDFDocument from "pdfkit";
import { gerarRelatorio } from "./gerarpdf";
import moment from "moment-timezone";
import { resolve } from "path";
import { Decimal } from "@prisma/client/runtime/library";
import { remove } from "remove-accents";

const PAYMENT_OPTIONS: { [s: string]: string } = {
  PIX: "PIX",
  Dinheiro: "Dinheiro",
  Crédito: "C Crédito",
  Débito: "C Débito",
};

const path = resolve(process.env.STORAGE_PATH!, "static", "image");

export class GenerateMenuOnlineReportUseCase {
  constructor() {}

  async run({ uuid, ...rest }: GenerateMenuOnlineReportDTO_I, res: Response) {
    const start = moment.utc(new Date(rest.start));
    const end = rest.end
      ? moment.utc(new Date(rest.end))
      : moment.utc(new Date(rest.start));

    const exist = await prisma.menusOnline.findFirst({
      where: { uuid },
      select: {
        id: true,
        logoImg: true,
        titlePage: true,
        Orders: {
          where: {
            createAt: {
              gte: start.startOf("day").toDate(),
              lte: end.endOf("day").toDate(),
            },
            deleted: false,
            status: {
              in: ["completed", "confirmed", "delivered"],
            },
          },
          orderBy: { createAt: "asc" },
          select: {
            tableId: true,
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
            Router: {
              select: {
                Router: {
                  select: {
                    ContactsWAOnAccount: {
                      select: { ContactsWA: { select: { realNumber: true } } },
                    },
                  },
                },
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

    const relatorio_motoboy = Object.values(
      exist.Orders.reduce(
        (acc, order) => {
          const number =
            order.Router?.Router?.ContactsWAOnAccount?.ContactsWA?.realNumber;

          if (!number) return acc;

          const total = order.OrderAdjustments.filter(
            (adj) => adj.label === "Taxa de entrega" && adj.type === "in",
          ).reduce((sum, adj) => sum.plus(adj.amount), new Decimal(0));

          if (total.isZero()) return acc;

          if (!acc[number]) {
            acc[number] = { number, amount: new Decimal(0), qntPdd: 0 };
          }

          acc[number].amount = acc[number].amount.plus(total);
          acc[number].qntPdd = acc[number].qntPdd + 1;

          return acc;
        },
        {} as Record<
          string,
          { number: string; amount: Decimal; qntPdd: number }
        >,
      ),
    ).map((item) => ({
      number: item.number,
      amount: item.amount.toNumber(),
      qntPdd: item.qntPdd,
    }));

    const countOrders = exist.Orders.length;
    const totalDeVendas = exist.Orders.reduce((ac, cr) => {
      ac += cr.sub_total?.toNumber() || 0; // total do pedido (sem taxas)
      return ac;
    }, 0);

    const totalTaxasDeEntrega = exist.Orders.reduce((ac, cr) => {
      const total = cr.OrderAdjustments.filter(
        (adj) => adj.label === "Taxa de entrega" && adj.type === "in",
      ).reduce((sum, adj) => sum.plus(adj.amount), new Decimal(0));
      ac += total.toNumber();
      return ac;
    }, 0);

    const totalTaxasPlataforma = exist.Orders.reduce((ac, cr) => {
      const total = cr.OrderAdjustments.filter(
        (adj) => adj.label === "Taxa plataforma" && adj.type === "out",
      ).reduce((sum, adj) => sum.plus(adj.amount), new Decimal(0));
      ac += total.toNumber();
      return ac;
    }, 0);

    const totalBruto = totalDeVendas + totalTaxasDeEntrega;
    const totalLiquido =
      totalBruto - totalTaxasDeEntrega - totalTaxasPlataforma;

    const totalPix = exist.Orders.reduce(
      (ac, cr) => {
        if (remove(cr.payment_method?.toLowerCase() || "") === "pix") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalDinheiro = exist.Orders.reduce(
      (ac, cr) => {
        if (remove(cr.payment_method?.toLowerCase() || "") === "dinheiro") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalDebito = exist.Orders.reduce(
      (ac, cr) => {
        if (remove(cr.payment_method?.toLowerCase() || "") === "debito") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );
    const totalCredito = exist.Orders.reduce(
      (ac, cr) => {
        if (remove(cr.payment_method?.toLowerCase() || "") === "credito") {
          ac.qnt += 1;
          ac.amount += cr.total?.toNumber() || 0;
        }
        return ac;
      },
      { qnt: 0, amount: 0 },
    );

    // const totalQnt =
    //   totalPix.qnt + totalDinheiro.qnt + totalDebito.qnt + totalCredito.qnt;
    // const totalAmount =
    //   totalPix.amount +
    //   totalDinheiro.amount +
    //   totalDebito.amount +
    //   totalCredito.amount;

    const pedidos = exist.Orders.map((ac) => {
      const valuePaymentMethod = Object.entries(PAYMENT_OPTIONS).find(
        ([key]) =>
          remove(key).toLowerCase() ===
          remove(ac.payment_method || "").toLowerCase(),
      );
      return {
        code: `${ac.n_order}`,
        name: `(${moment(ac.createAt).tz("America/Sao_Paulo").format("DD/MM/YYYY HH:mm")}) ${ac.name}`,
        forma_de_pagamento: valuePaymentMethod?.[1] || "",
        valorPd: ac.sub_total?.toNumber() || 0,
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
        totalBruto: ac.total?.toNumber() || 0,
        totalLiquido: ac.net_total?.toNumber() || 0,
      };
    });

    const date_start = moment(new Date(rest.start)).format("DD/MM/YYYY");
    const date_end = rest.end
      ? moment(new Date(rest.end)).format("DD/MM/YYYY")
      : null;

    let data_formatada = date_start;

    if (date_end) {
      if (!(date_end === date_start)) {
        data_formatada += ` - ${date_end}`;
      }
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${data_formatada.replace(/\s/g, "")}_relatorio.pdf"`,
    );
    res.setHeader("Cache-Control", "no-store");

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(res);

    gerarRelatorio(doc, {
      loja: exist.titlePage || "",
      resumo: {
        bruto: totalBruto,
        liquido: totalLiquido,
        taxaEntrega: totalTaxasDeEntrega,
        taxaPlataforma: totalTaxasPlataforma,
        vendas: totalDeVendas,
        qntVendas: countOrders,
      },
      pedidos,
      pagamentos: [
        {
          tipo: "PIX",
          total: totalPix.amount,
          vendas: totalPix.qnt,
        },
        {
          tipo: "Dinheiro",
          total: totalDinheiro.amount,
          vendas: totalDinheiro.qnt,
        },
        {
          tipo: "Cartão Crédito",
          total: totalCredito.amount,
          vendas: totalCredito.qnt,
        },
        {
          tipo: "Cartão Débito",
          total: totalDebito.amount,
          vendas: totalDebito.qnt,
        },
      ],
      logo: path + `/${exist.logoImg}`,
      data: data_formatada,
      relatorio_motoboy: relatorio_motoboy.sort((a, b) => b.amount - a.amount),
    });

    doc.end();

    try {
      return {
        message: "OK!",
        status: 201,
      };
    } catch (error) {
      throw new ErrorResponse(400).container(
        "Error ao tentar gerar relatório.",
      );
    }
  }
}
