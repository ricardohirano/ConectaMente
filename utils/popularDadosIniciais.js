import popularFases from "./popularFases.js";
import popularAcoes from "./popularAcoes.js";
import popularOpcoesResposta from "./popularOpcoesResposta.js";

export default async function popularDadosIniciais() {
  try {
    await popularFases();
    await popularAcoes();
    await popularOpcoesResposta();

    console.log("Dados iniciais populados com sucesso.");
  } catch (error) {
    console.log("Erro ao popular dados iniciais:", error);
  }
}