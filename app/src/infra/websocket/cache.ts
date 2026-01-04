interface CacheStateUserSocket {
  // accountId: number;
  listSocket: {
    id: string;
    platform: "android" | "ios" | "desktop";
    isMobile: boolean;
    isPWA: boolean;
    focused: null | string;
  }[];
  linkedPages?: string[];
  currentTicket?: number | null;
}

export const cacheAccountSocket: Map<number, CacheStateUserSocket> = new Map();
export const cacheRootSocket: string[] = [];

export const cacheSocketHumanServiceUsers: Map<string, number> = new Map();
// export const cacheStateUserSocket: Map<number, CacheStateUserSocket> = new Map();
