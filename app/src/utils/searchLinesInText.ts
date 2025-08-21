export function searchLinesInText(TEXT: string, query?: string) {
  if (!query) return [{ value: TEXT, score: 1 }];

  const stripAccents = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const norm = (s: string) =>
    stripAccents(s).toLowerCase().replace(/\s+/g, " ").trim();

  const tokenize = (s: string) =>
    norm(s)
      .split(/[^a-z0-9]+/)
      .filter(Boolean);

  const LINES = TEXT.split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const INDEX = LINES.map((raw, i) => {
    return {
      raw,
      tokens: new Set(tokenize(raw)),
    };
  });

  function scoreLine(query: string, item: (typeof INDEX)[number]) {
    const qTokens = tokenize(query);
    if (!qTokens.length) return 0;

    let hits = 0;
    let sequential = 0;
    let lastPos = -1;

    const itemTokensArr = Array.from(item.tokens);
    const itemTokensPos = new Map<string, number>();
    itemTokensArr.forEach((t, i) => itemTokensPos.set(t, i));

    qTokens.forEach((qt, qi) => {
      const matchIdx = itemTokensArr.findIndex(
        (it) => it === qt || it.startsWith(qt) || qt.startsWith(it)
      );
      if (matchIdx >= 0) {
        hits++;
        if (lastPos >= 0 && matchIdx > lastPos) sequential++;
        lastPos = matchIdx;
      }
    });

    if (hits === 0) return 0;

    // base = cobertura de termos
    const coverage = hits / qTokens.length;

    // bônus ordem/sequência
    const orderBonus = sequential > 0 ? sequential / qTokens.length : 0;

    // bônus numérico (“4 queijos” casa bem)
    const numericBonus = /\d/.test(query) && /\d/.test(item.raw) ? 0.2 : 0;

    // pequenos ajustes por comprimento (linhas menores tendem a ser mais específicas)
    const brevity = Math.max(0, 1 - itemTokensArr.length / 12);

    return coverage * 0.6 + orderBonus * 0.2 + numericBonus + brevity * 0.2;
  }

  return INDEX.map((it) => ({ ...it, score: scoreLine(query, it) }))
    .filter((it) => it.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((it) => ({
      value: it.raw,
      score: +it.score.toFixed(3),
    }));
}
