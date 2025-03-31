type PropsOpt = {
  removeNine?: boolean;
  removeIdd?: boolean;
};

const listIdd: { [x: string]: "BR" | undefined } = {
  "55": "BR",
};

export const validatePhoneNumber = (
  number: string,
  options?: PropsOpt
): string | null => {
  let nNumber: string | null = number.replace(/\D/g, "");

  let idd = listIdd[nNumber.slice(0, 2)];
  if (!idd) {
    nNumber = "55" + nNumber;
    idd = "BR";
  }

  if (idd === "BR") {
    nNumber = nNumber.slice(2);
    if (nNumber.length < 10 || nNumber.length > 11) {
      return null;
    }
    if (nNumber.length === 11) {
      const isNine = /^(\d{2})9(.*)$/.test(nNumber);
      if (isNine) {
        if (options?.removeNine) {
          nNumber = nNumber.replace(/^(\d{2})9(.*)$/, "$1$2");
        }
        if (!options?.removeIdd) nNumber = "55" + nNumber;
      } else {
        nNumber = null;
      }
    } else if (nNumber.length === 10) {
      if (!options?.removeIdd) nNumber = "55" + nNumber;
    }
    return nNumber;
  }
  return null;
};
