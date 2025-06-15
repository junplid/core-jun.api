interface CacheStateUserSocket {
  // accountId: number;
  listSocket: string[];
  isMobile?: boolean;
  linkedPages?: string[];
}

export const cacheAccountSocket: Map<number, CacheStateUserSocket> = new Map();

export const cacheSocketAccount: Map<number, string> = new Map();
export const cacheSocketHumanServiceUsers: Map<string, number> = new Map();
