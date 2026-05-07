import Fase from "../models/fase.js";

async function popularFases() {
  try {
    const totalFases = await Fase.count();

    if (totalFases > 0) {
      console.log("As fases já estão cadastradas.");
      return;
    }

    await Fase.bulkCreate([
      { nome: "Quarto", slug: "quarto", ordem_fase: 1, imagem_fundo: "fase-quarto.png", ativa: true },
      { nome: "Banheiro", slug: "banheiro", ordem_fase: 2, imagem_fundo: "fase-banheiro.png", ativa: true },
      { nome: "Cozinha", slug: "cozinha", ordem_fase: 3, imagem_fundo: "fase-cozinha.png", ativa: true },
      { nome: "Sala", slug: "sala", ordem_fase: 4, imagem_fundo: "fase-sala.png", ativa: true },
      { nome: "Extras", slug: "extras", ordem_fase: 5, imagem_fundo: "fase-extras.png", ativa: true }
    ]);

    console.log("Fases cadastradas com sucesso.");
  } catch (error) {
    console.log("Erro ao popular fases: " + error);
  }
}

export default popularFases;