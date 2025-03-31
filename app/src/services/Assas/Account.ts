import { AxiosError } from "axios";
import { ApiAssas } from "./api";

interface SubAccount {
  id: string; // Identificador único da subconta no Asaas
  name: string; // Nome da subconta
  email: string; // Email da subconta
  loginEmail?: string; // Email para login da subconta (opcional)
  phone: string; // Telefone Fixo
  mobilePhone: string; // Telefone Celular
  address: string; // Logradouro
  addressNumber: string; // Número do endereço
  complement?: string; // Complemento do endereço (opcional)
  province: string; // Bairro
  postalCode: string; // CEP do endereço
  cpfCnpj: string; // CPF ou CNPJ do proprietário da subconta
  birthDate?: Date; // Data de nascimento (somente quando Pessoa Física)
  personType: "JURIDICA" | "FISICA"; // Tipo de Pessoa
  companyType?: "MEI" | "LIMITED" | "INDIVIDUAL" | "ASSOCIATION"; // Tipo da empresa (Pessoa Jurídica)
  city: number; // Identificador único da cidade no Asaas
  state: string; // Sigla do Estado
  country: string; // País (Fixo Brasil)
  tradingName: string; // Nome de exibição (preenchido automaticamente)
  site?: string; // URL do site da subconta (opcional)
  walletId: string; // Identificador único da carteira
  accountNumber: {
    agency: string; // Agência da conta
    account: string; // Número da conta
    accountDigit: string; // Dígito da conta
  };
  commercialInfoExpiration?: {
    isExpired: boolean; // Indica se os dados comerciais estão expirados
    scheduledDate: string; // Data de expiração dos dados comerciais
  };
  apiKey: string; // Chave de API
}

export async function createSubAccountAssas(props: {
  name: string;
  email: string;
  cpfCnpj: string;
  mobilePhone: string;
  incomeValue: number;
  address: string;
  addressNumber: string;
  province: string;
  birthDate?: string;
  postalCode: string;
}): Promise<SubAccount> {
  try {
    const { data } = await ApiAssas.post("/accounts", props);
    return data;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) throw 401;
    }
    throw error;
  }
}
