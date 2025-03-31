export interface ResultFetch {
  createAt: Date;
  content: string;
  subject: string;
  status: "unread" | "read";
  id: number;
}

export interface GetNotificationsHumanServiceRepository_I {
  fetch(userId: number): Promise<ResultFetch[]>;
}
