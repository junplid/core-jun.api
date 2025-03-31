import axios from "axios";

export const getBrazilianCities = async () => {
  try {
    const response = await axios.get(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios"
    );
    return response.data.map((cidade: any) => cidade.nome);
  } catch (error) {
    console.error("Erro ao buscar as cidades:", error);
    return [];
  }
};
