export interface CreateCloneBusinessParamsDTO_I {
  id: number;
}

export interface CreateCloneBusinessBodyDTO_I {
  accountId: number;
  flow?: boolean; // quando diz pra clonar fluxo, já quer dizer clonar tags, variaveis, checkpoints, links, numberos e endereços de geo localização
  kanban?: boolean; //
  sector?: boolean; //
  connection?: boolean;
  audience?: boolean; //
  receptiveService?: boolean; // aqui quer dizer que é o atendimento receptivo
}

export type CreateCloneBusinessDTO_I = CreateCloneBusinessBodyDTO_I &
  CreateCloneBusinessParamsDTO_I;
