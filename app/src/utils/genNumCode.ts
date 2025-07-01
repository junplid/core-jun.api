import { customAlphabet } from "nanoid";

const numericNanoid = customAlphabet("0123456789");
export function genNumCode(length: number): string {
  return numericNanoid(length);
}
