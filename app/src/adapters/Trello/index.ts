// Trello.ts
// Classe para integração com API do Trello usando axios

import axios, { AxiosResponse } from "axios";

interface AuthParams {
  key: string;
  token: string;
}

export interface Card {
  id: string;
  name: string;
  desc: string;
  idList: string;
  [key: string]: any;
}

export interface List {
  id: string;
  name: string;
  [key: string]: any;
}

export class Trello {
  private key: string;
  private token: string;
  private baseURL: string = "https://api.trello.com/1";

  constructor(key: string, token: string) {
    this.key = key;
    this.token = token;
  }

  private get authParams(): AuthParams {
    return { key: this.key, token: this.token };
  }

  public async adicionarCard(
    name: string,
    desc: string,
    idList: string,
    pos: "top" | "bottom" | number = "bottom"
  ): Promise<Card> {
    const response: AxiosResponse<Card> = await axios.post(
      `${this.baseURL}/cards`,
      null,
      { params: { name, desc, idList, pos, ...this.authParams } }
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
      {
        params: {
          ...(data.name && { name: data.name }),
          ...(data.desc && { desc: data.desc }),
          ...this.authParams,
        },
      }
    );
    return response.data;
  }

  public async moverCard(idCard: string, idList: string): Promise<Card> {
    const response: AxiosResponse<Card> = await axios.put(
      `${this.baseURL}/cards/${idCard}`,
      null,
      { params: { idList, ...this.authParams } }
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
}
