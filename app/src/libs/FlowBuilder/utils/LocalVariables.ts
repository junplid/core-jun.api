import { cacheLocalVariablesControl } from "../../../adapters/Baileys/Cache";

export const localVariables = {
  upsert(keyControl: string, value: [string, string]) {
    let varLocal = cacheLocalVariablesControl.get(keyControl);

    if (!varLocal) {
      varLocal = [];
      cacheLocalVariablesControl.set(keyControl, varLocal);
    }

    const found = varLocal.find(([name]) => name === value[0]);

    if (found) {
      found[1] = value[1];
    } else {
      varLocal.push(value);
    }
  },
};
