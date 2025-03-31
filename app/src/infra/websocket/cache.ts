interface CacheStateUserSocket {
  id: number;
  listSocket: string[];
  isMobile: boolean;
  linkedPages: string[];
  currentPage: string;
  currentTicket: number | null;
}

export const CacheStateUserSocket: Map<number, CacheStateUserSocket> =
  new Map();

export const cacheSocketAccount: Map<number, string> = new Map();
export const cacheSocketHumanServiceUsers: Map<string, number> = new Map();
