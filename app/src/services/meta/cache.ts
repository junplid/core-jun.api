import NodeCache from "node-cache";

export const metaAccountsCache = new NodeCache({
  stdTTL: 600,
  useClones: false,
});
