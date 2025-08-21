export const parseDirtyStringToNumber = (s: string): number => {
  const only = String(s).replace(/[^\d.,]/g, "");
  const norm = only.replace(/[.,](?=[^.,]*[.,])/g, "").replace(",", ".");
  return norm ? Number(norm) : NaN;
};
