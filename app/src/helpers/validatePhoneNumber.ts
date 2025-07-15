import { parsePhoneNumberWithError } from "libphonenumber-js";

// type PropsOpt = {
//   removeNine?: boolean;
//   removeIdd?: boolean;
// };

// const listIdd: { [x: string]: "BR" | undefined } = {
//   "55": "BR",
// };

export const validatePhoneNumber = (
  number: string
  // options?: PropsOpt
): string | null => {
  let nNumber: string | null = number.replace(/\D/g, "");
  const pn = parsePhoneNumberWithError(nNumber, {
    defaultCountry: "BR",
  });

  if (pn.isValid()) return pn.number.replace("+", "");
  return null;
};
