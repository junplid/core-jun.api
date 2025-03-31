import { TypeHumanServiceReportLead } from "@prisma/client";

export interface PropsAlreadyExisting {
  userId: number;
  id: number;
}

export interface PropsUpdate {
  id: number;
  value: string;
  type: TypeHumanServiceReportLead;
}

export interface UpdateReportLeadHumanServiceRepository_I {
  alreadyExisting(props: PropsAlreadyExisting): Promise<number>;
  update(props: PropsUpdate): Promise<void>;
}
