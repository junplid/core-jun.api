import axios, { AxiosResponse } from "axios";

interface AuthParams {
  key: string;
  token: string;
}

export interface Card {
  id: string;
  name: string;
  desc?: string;
  idList: string;
  [key: string]: any;
}

export interface List {
  id: string;
  name: string;
  [key: string]: any;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  idBoard: string;
  [key: string]: any;
}

export interface Board {
  id: string;
  name: string;
}

export class Trello {
  private key: string;
  private token: string;
  private baseURL = "https://api.trello.com/1";

  constructor(key: string, token: string) {
    this.key = key;
    this.token = token;
  }

  private get authParams(): AuthParams {
    return { key: this.key, token: this.token };
  }

  public async adicionarCard(
    idList: string,
    data: {
      name: string;
      pos: "top" | "bottom" | number;
      desc?: string;
    }
  ): Promise<Card> {
    const response: AxiosResponse<Card> = await axios.post(
      `${this.baseURL}/cards`,
      null,
      { params: { idList, ...this.authParams, ...data } }
    );
    return response.data;
  }

  public async removerCard(idCard: string): Promise<any> {
    const response: AxiosResponse = await axios.delete(
      `${this.baseURL}/cards/${idCard}`,
      { params: this.authParams }
    );
    return response.data;
  }

  public async editarCard(
    idCard: string,
    data: { name?: string; desc?: string }
  ): Promise<Card> {
    const response: AxiosResponse<Card> = await axios.put(
      `${this.baseURL}/cards/${idCard}`,
      null,
      { params: { ...this.authParams, ...data } }
    );
    return response.data;
  }

  public async moverCard({
    idCard,
    ...props
  }: {
    idCard: string;
    idList: string;
    idBoard?: string;
  }): Promise<Card> {
    const response: AxiosResponse<Card> = await axios.put(
      `${this.baseURL}/cards/${idCard}`,
      null,
      { params: { ...props, ...this.authParams } }
    );
    return response.data;
  }

  public async listarCardsPorLista(idList: string): Promise<Card[]> {
    const response: AxiosResponse<Card[]> = await axios.get(
      `${this.baseURL}/lists/${idList}/cards`,
      { params: this.authParams }
    );
    return response.data;
  }

  public async obterIdListaPorNome(
    idBoard: string,
    listName: string
  ): Promise<string | null> {
    const response: AxiosResponse<List[]> = await axios.get(
      `${this.baseURL}/boards/${idBoard}/lists`,
      { params: this.authParams }
    );
    const lista = response.data.find((l) => l.name === listName);
    return lista ? lista.id : null;
  }

  public async criarLista(name: string, idBoard: string): Promise<List> {
    const response: AxiosResponse<List> = await axios.post(
      `${this.baseURL}/lists`,
      null,
      { params: { name, idBoard, ...this.authParams } }
    );
    return response.data;
  }

  public async adicionarEtiqueta(
    idCard: string,
    idLabel: string
  ): Promise<any> {
    const response: AxiosResponse = await axios.post(
      `${this.baseURL}/cards/${idCard}/idLabels`,
      null,
      { params: { value: idLabel, ...this.authParams } }
    );
    return response.data;
  }

  public async criarEtiqueta(
    name: string,
    color: string,
    idBoard: string
  ): Promise<Label> {
    const response: AxiosResponse<Label> = await axios.post(
      `${this.baseURL}/labels`,
      null,
      { params: { name, color, idBoard, ...this.authParams } }
    );
    return response.data;
  }

  public async listarEtiquetas(idBoard: string): Promise<Label[]> {
    const response: AxiosResponse<Label[]> = await axios.get(
      `${this.baseURL}/boards/${idBoard}/labels`,
      { params: this.authParams }
    );
    return response.data;
  }

  public async listarEtiquetasDoCard(idCard: string): Promise<Label[]> {
    const response: AxiosResponse<Label[]> = await axios.get(
      `${this.baseURL}/cards/${idCard}/labels`,
      { params: this.authParams }
    );
    return response.data;
  }

  public async comentarCard(idCard: string, text: string): Promise<any> {
    const response: AxiosResponse = await axios.post(
      `${this.baseURL}/cards/${idCard}/actions/comments`,
      null,
      { params: { text, ...this.authParams } }
    );
    return response.data;
  }

  public async adicionarMembro(idCard: string, memberId: string): Promise<any> {
    const response: AxiosResponse = await axios.post(
      `${this.baseURL}/cards/${idCard}/idMembers`,
      null,
      { params: { value: memberId, ...this.authParams } }
    );
    return response.data;
  }

  public async listarQuadros(): Promise<Board[]> {
    const response: AxiosResponse<Board[]> = await axios.get(
      `${this.baseURL}/members/me/boards`,
      { params: { ...this.authParams, fields: "id,name" } }
    );
    return response.data;
  }

  public async listarListasPorQuadro(idBoard: string): Promise<List[]> {
    const response: AxiosResponse<List[]> = await axios.get(
      `${this.baseURL}/boards/${idBoard}/lists`,
      { params: this.authParams }
    );
    return response.data;
  }
}
