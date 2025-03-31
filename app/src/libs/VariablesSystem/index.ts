import moment from "moment-timezone";
import "moment/locale/pt-br";

export const getVariableSystem = () => {
  const now = moment().locale("pt-br").tz("America/Sao_Paulo");

  // depois implementar esses abaixo
  // {sys_palavra_ativadora} (palavra que ativou o bot de atendimento)
  // {sys_atendente} (nome do atendente)
  // {sys_setor} (nome do setor)
  // {sys_protocolo} (protocolo de atendimento)
  // {sys_negócio} (nome do negócio)
  // {sys_contato_nome} (nome no whatsapp)
  // {sys_contato_numero} (numero no whatsapp)
  // {sys_contato_ddd} (ddd do contato do whatsapp)
  // {sys_contato_status} (status do whatsapp)
  // {sys_contato_tipo} (se o whats é bussines ou pessoal)

  const getSaudacao = () => {
    const hora = now.hour();
    if (hora < 12) {
      return "Bom dia";
    } else if (hora < 18) {
      return "Boa tarde";
    } else {
      return "Boa noite";
    }
  };

  return [
    {
      id: 1,
      name: "SYS_SAUDACAO",
      value: getSaudacao(),
      business: [],
      type: "system",
    },
    {
      id: 2,
      name: "SYS_HORA_ATUAL",
      value: now.format("HH"),
      business: [],
      type: "system",
    },
    {
      id: 3,
      name: "SYS_DATA_ATUAL",
      value: now.format("DD/MM/YYYY"),
      business: [],
      type: "system",
    },
    {
      id: 4,
      name: "SYS_DIA_ATUAL",
      value: now.format("DD"),
      business: [],
      type: "system",
    },
    {
      id: 5,
      name: "SYS_MES_ATUAL",
      value: now.format("MM"),
      business: [],
      type: "system",
    },
    {
      id: 6,
      name: "SYSTEM_NOME_MES_ATUAL",
      value: now.format("MMMM"),
      business: [],
      type: "system",
    },
    {
      id: 7,
      name: "SYS_ANO_ATUAL",
      value: now.format("YYYY"),
      business: [],
      type: "system",
    },
    {
      id: 8,
      name: "SYS_MINUTOS_ATUAL",
      value: now.format("mm"),
      business: [],
      type: "system",
    },
    {
      id: 9,
      name: "SYS_SEGUNDOS_ATUAL",
      value: now.format("ss"),
      business: [],
      type: "system",
    },
    {
      id: 10,
      name: "SYS_DIA_DA_SEMANA",
      value: now.format("dddd"),
      business: [],
      type: "system",
    },
  ];
};
