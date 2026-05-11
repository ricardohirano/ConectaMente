import Fase from "../models/fase.js";

export default async function popularFases() {
  const fases = [
    {
      nome: "Quarto",
      slug: "quarto",
      ordem_fase: 1,
      imagem_fundo: "/img/game/fases/quarto/fundo/fundoQuarto.svg",
      ativa: true
    },
    {
      nome: "Banheiro",
      slug: "banheiro",
      ordem_fase: 2,
      imagem_fundo: "/img/game/fases/banheiro/fundo/fundoBanheiro.svg",
      ativa: true
    },
    {
      nome: "Cozinha",
      slug: "cozinha",
      ordem_fase: 3,
      imagem_fundo: "/img/game/fases/cozinha/fundo/fundoCozinha.svg",
      ativa: true
    },
    {
      nome: "Sala",
      slug: "sala",
      ordem_fase: 4,
      imagem_fundo: "/img/game/fases/sala/fundo/fundoSala.svg",
      ativa: true
    },
    {
      nome: "Extras",
      slug: "extras",
      ordem_fase: 5,
      imagem_fundo: "/img/game/fases/extras/fundo/fundoExtras.svg",
      ativa: true
    }
  ];

  for (const fase of fases) {
    await Fase.findOrCreate({
      where: { slug: fase.slug },
      defaults: fase
    });
  }
}