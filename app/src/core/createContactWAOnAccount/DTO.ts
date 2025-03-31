export interface CreateContactWAOnAccountDTO_I {
  name: string;
  number: string;
  completeNumber: string;
  tags?: string[];
  accountId: number;
  businessId: number[];
  variables?: { [x: string]: string };
  isCheck?: boolean;
}
