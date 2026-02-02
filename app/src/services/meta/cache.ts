import NodeCache from "node-cache";

export const metaAccountsCache = new NodeCache({
  useClones: false,
});
