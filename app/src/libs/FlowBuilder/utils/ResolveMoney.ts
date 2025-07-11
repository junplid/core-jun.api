import { Decimal } from "@prisma/client/runtime/library";

export function resolveMoney(value: string): Decimal {
  const cleaned = value.replace(/\./g, "").replace(/,/g, ".");
  return new Decimal(cleaned);
}
