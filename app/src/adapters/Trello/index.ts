import axios, { AxiosError } from "axios";

interface PropsCreateCard {
  name: string;
  idList: string;
  desc?: string;
  pos?: "top" | "bottom" | number;
  due?: Date;
  start?: Date | null;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
}

interface PropsGetBoards {
  memberId?: string;
}

interface PropsGetListOfBoard {
  boardId: string;
}

export class Trello {
  private readonly baseURL: string = "https://api.trello.com/1";
  private readonly auth: string;

  constructor(key: string, token: string) {
    this.auth = `key=${key}&token=${token}`;
  }

  public async createCard(props: PropsCreateCard): Promise<{
    dateLastActivity: Date;
    id: string;
  }> {
    try {
      const { data } = await axios.post(
        this.baseURL + `/cards?${this.auth}`,
        props,
        { headers: { Accept: "application/json" } }
      );
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw error;
    }
  }

  public async getBoards({ memberId = "me" }: PropsGetBoards): Promise<
    {
      id: string;
      name: string;
    }[]
  > {
    try {
      const { data } = await axios.get(
        this.baseURL + `/members/${memberId}/boards?${this.auth}`,
        { headers: { Accept: "application/json" } }
      );
      return data.map((a: any) => ({ id: a.id, name: a.name }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw error;
    }
  }

  public async getListOfBoard({
    boardId,
  }: PropsGetListOfBoard): Promise<{ name: string; id: string }[]> {
    try {
      const { data } = await axios.get(
        this.baseURL + `/boards/${boardId}/lists?${this.auth}`,
        { headers: { Accept: "application/json" } }
      );
      return data.map((s: any) => ({ id: s.id, name: s.name }));
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      throw error;
    }
  }
}
