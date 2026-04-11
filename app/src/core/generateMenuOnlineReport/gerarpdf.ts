function drawTable(
  doc: any,
  startX: number,
  startY: number,
  colWidths: any,
  headers: any[],
  rows: any[][],
) {
  let y = startY;
  const rowHeight = 20;

  // Header
  doc.font("Helvetica-Bold").fontSize(10);
  if (headers.length) {
    headers.forEach((header, i) => {
      const x =
        startX +
        colWidths.slice(0, i).reduce((a: number, b: number) => a + b, 0);
      const textHeight = doc.heightOfString(header, {
        width: colWidths[i],
      });
      const textY = y + (rowHeight - textHeight) / 1.6;
      // Borda
      doc.lineWidth(0.5);
      doc.rect(x, y, colWidths[i], rowHeight).stroke();
      doc.text(header, x + 4, textY, {
        width: colWidths[i],
        align: "left",
      });
    });
    y += 20;
  }

  // Linhas
  if (!headers.length) {
    doc.font("Helvetica-Bold").fontSize(10);
  } else {
    doc.font("Helvetica").fontSize(10);
  }
  rows.forEach((row) => {
    const padding = 4;

    // ===== CALCULAR ALTURA DINÂMICA DA LINHA =====
    let rowHeight = 0;

    row.forEach((cell, i) => {
      const cellText = typeof cell === "object" ? cell.text : cell;

      const textHeight = doc.heightOfString(cellText, {
        width: colWidths[i] - padding * 2,
      });

      rowHeight = Math.max(rowHeight, textHeight + padding * 2);
    });

    // ===== DESENHAR LINHA =====
    row.forEach((cell, i) => {
      const x =
        startX +
        colWidths.slice(0, i).reduce((a: number, b: number) => a + b, 0);

      const cellText = typeof cell === "object" ? cell.text : cell;
      const fillColor = typeof cell === "object" ? cell.fillColor : null;
      const textColor =
        typeof cell === "object" ? cell.textColor || "black" : "black";

      // ===== BACKGROUND =====
      if (fillColor) {
        doc.rect(x, y, colWidths[i], rowHeight).fill(fillColor);
      }

      // ===== BORDA =====
      doc
        .lineWidth(0.5)
        .strokeColor("#000")
        .rect(x, y, colWidths[i], rowHeight)
        .stroke();

      // ===== TEXTO CENTRALIZADO VERTICAL =====
      const textHeight = doc.heightOfString(cellText, {
        width: colWidths[i] - padding * 2,
      });

      const textY = y + (rowHeight - textHeight) / 2;

      doc.fillColor(textColor).text(cellText, x + padding, textY, {
        width: colWidths[i] - padding * 2,
        align: "left",
      });

      doc.fillColor("black");
    });

    // avança corretamente pela altura real da linha
    y += rowHeight;
  });

  return y;
}

export function gerarRelatorio(
  doc: PDFKit.PDFDocument,
  dados: {
    loja: string;
    logo: string;
    data: string;
    resumo: {
      vendas: number;
      taxaEntrega: number;
      bruto: number;
      liquido: number;
      qntVendas: number;
      taxaPlataforma: number;
    };
    pagamentos: {
      tipo: string;
      vendas: number;
      total: number;
    }[];
    pedidos: {
      code: string;
      name: string;
      forma_de_pagamento: string;
      valorPd: number;
      txEntr: number;
      txPd: number;
      totalBruto: number;
      totalLiquido: number;
    }[];
    relatorio_motoboy: { number: string; amount: number; qntPdd: number }[]; // nova chave
  },
) {
  // ===== LOGO =====
  if (dados.logo) {
    doc.image(dados.logo, 30, 30, { width: 60 });
  }

  // ===== TÍTULO =====
  doc
    .fontSize(18)
    .text(dados.loja, 120, 30)
    .fontSize(14)
    .text("Relatório de Fechamento - Cardápio digital")
    .fontSize(12)
    .font("Helvetica-Bold")
    .text(dados.data)
    .font("Helvetica");

  doc.moveDown(2);

  // ===== RESUMO FINANCEIRO =====
  doc.x = doc.page.margins.left;
  doc.fontSize(10).text("Resumo Financeiro", { align: "left" });

  const totalWIdth = 200 + 80 + 150 + 90;

  drawTable(
    doc,
    40,
    doc.y + 3,
    [totalWIdth - 100, 100],
    ["Descrição", "Valor"],
    [
      ["Quantidade de vendas realizadas", dados.resumo.qntVendas],
      [
        { text: "Valor total de vendas" },
        { text: `R$ ${dados.resumo.vendas.toFixed(2)}` },
      ],
      [
        { text: "Taxa de entrega (cobrada do cliente)" },
        {
          text: `+ R$ ${dados.resumo.taxaEntrega.toFixed(2)}`,
          textColor: "green",
        },
      ],
      [
        { text: "Total bruto" },
        { text: `R$ ${dados.resumo.bruto.toFixed(2)}` },
      ],
      [
        {
          text: "Taxas por pedido confimado (plataforma)",
        },
        {
          text: `- R$ ${dados.resumo.taxaPlataforma.toFixed(2)}`,
          textColor: "red",
        },
      ],
      [
        { text: "Repasse motoboy" },
        {
          text: `- R$ ${dados.resumo.taxaEntrega.toFixed(2)}`,
          textColor: "red",
        },
      ],
      [
        { text: "Total líquido" },
        { text: `R$ ${dados.resumo.liquido}`, textColor: "green" },
      ],
    ],
  );

  doc.moveDown(2);

  // ===== PAGAMENTOS =====
  doc.x = doc.page.margins.left;
  doc.fontSize(10).text("Total por Meio de Pagamento", { align: "left" });

  const pagamentoRows = dados.pagamentos.map((p) => [
    p.tipo,
    p.vendas,
    `R$ ${p.total.toFixed(2)}`,
  ]);

  const countTotalVendas = dados.pagamentos.reduce(
    (ac, cr) => cr.vendas + ac,
    0,
  );
  const countTotalPrice = dados.pagamentos.reduce((ac, cr) => cr.total + ac, 0);

  drawTable(
    doc,
    40,
    doc.y + 3,
    [totalWIdth - (55 + 100), 55, 100],
    ["Meio de pagamento", "QNT", "Total (R$)"],
    pagamentoRows,
  );

  drawTable(
    doc,
    40,
    doc.y + 10,
    [totalWIdth - (55 + 100), 55, 100],
    [],
    [["TOTAL", countTotalVendas, `R$ ${countTotalPrice.toFixed(2)}`]],
  );

  // ===== NOVA PÁGINA (PEDIDOS) =====
  doc.addPage();

  doc.fontSize(14).text("Pedidos", { underline: true });

  const totalValorPd = dados.pedidos.reduce((acc, p) => acc + p.valorPd, 0);
  const totalTxEntr = dados.pedidos.reduce((acc, p) => acc + p.txEntr, 0);
  const totalTxPd = dados.pedidos.reduce((acc) => acc + 0.08, 0); // ou p.txPd se existir
  const totalBruto = dados.pedidos.reduce((acc, p) => acc + p.totalBruto, 0);

  const pedidoRows = dados.pedidos.map((p) => [
    `${p.code}`,
    p.name,
    p.forma_de_pagamento,
    `R$ ${p.valorPd.toFixed(2)}`,
    `R$ ${p.txEntr.toFixed(2)}`,
    `- 0.08`,
    `R$ ${p.totalBruto.toFixed(2)}`,
  ]);

  drawTable(
    doc,
    40,
    doc.y + 10,
    [42, totalWIdth - (42 + 64 + 55 + 54 + 62 + 90), 64, 55, 62, 54, 90],
    [
      "CODE",
      "Data, cliente",
      "FormaPg",
      "ValorPdd",
      "TxEntr",
      "TxPdd",
      "Total",
    ],
    pedidoRows,
  );

  drawTable(
    doc,
    40,
    doc.y + 10,
    [42, totalWIdth - (42 + 64 + 55 + 54 + 62 + 90), 64, 55, 62, 54, 90],
    [],
    [
      [
        "", // CODE
        "TOTAL", // coluna principal
        "", // FormaPg
        `R$ ${totalValorPd.toFixed(2)}`,
        `R$ ${totalTxEntr.toFixed(2)}`,
        `- ${totalTxPd.toFixed(2)}`,
        `R$ ${totalBruto.toFixed(2)}`,
      ],
    ],
  );

  if (dados.relatorio_motoboy?.length) {
    doc.addPage();

    doc.fontSize(14).text("Repasse por Motoboy", { underline: true });

    const rows = dados.relatorio_motoboy.map((item) => [
      item.qntPdd,
      item.number,
      `R$ ${item.amount.toFixed(2)}`,
    ]);

    const total = dados.relatorio_motoboy.reduce(
      (acc, cur) => acc + cur.amount,
      0,
    );

    const totalPedidos = dados.relatorio_motoboy.reduce(
      (acc, cur) => acc + cur.qntPdd,
      0,
    );

    // tabela principal
    drawTable(
      doc,
      40,
      doc.y + 10,
      [100, 250, 120],
      ["QNT", "Número", "Total (R$)"],
      rows,
    );

    // linha de total
    drawTable(
      doc,
      40,
      doc.y + 10,
      [100, 250, 120],
      [],
      [[totalPedidos, "TOTAL", `R$ ${total.toFixed(2)}`]],
    );
  }
}
