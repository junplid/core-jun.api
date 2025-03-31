export interface ModulesPermissions {
  campaign: boolean;
  business: boolean;
  sector: boolean;
  sectorAttendants: boolean;
  flows: boolean;
  emailService: boolean;
  chatbot: boolean;
  campaignAudience: boolean;
  contactWAOnAccount: boolean;
  uploadFile: boolean;
  checkpoint: boolean;
  integration: boolean;
  dataFlow: boolean;
  campaignOndemand: boolean;
  campaignParameters: boolean;
  connections: boolean;
  supervisors: boolean;
  servicesConfig: boolean;
  users: boolean;
  tags: boolean;
  variables: boolean;
  customizationLink: boolean;
}
export interface CreateSubAccountDTO_I {
  accountId: number;
  email: string;
  password: string;
  name: string;
  status: boolean;
  permissions?: {
    create?: Partial<ModulesPermissions>;
    delete?: Partial<ModulesPermissions>;
    update?: Partial<ModulesPermissions>;
  };
}
