export interface LoginHumanServiceRepository_I {
  findSectorsAttendants(props: { username: string }): Promise<{
    id: number;
    password: string;
    office: string;
    name: string;
    status: boolean;
    hash: string;
    sector?: {
      name: string;
      businessId: number;
      id: number;
      business: string;
    };
  } | null>;
  findSupervisors(props: { username: string }): Promise<{
    id: number;
    password: string;
    hash: string;
    name: string;
    sector: { name: string; id: number; business: string }[];
  } | null>;
}
