import Fase from "../models/fase.js";
import Acao from "../models/acao.js";

export default async function popularAcoes() {
  const faseQuarto = await Fase.findOne({
    where: { slug: "quarto" }
  });

  if (!faseQuarto) {
    throw new Error("Fase 'quarto' não encontrada para popular ações.");
  }

  const acoesQuarto = [
    {
      id_fase: faseQuarto.id,
      nome: "Arrumar a cama",
      slug: "cama",
      ordem_acao: 1,
      pergunta: "Qual é a ação correta?",
      mensagem_acerto: "Você arrumou a cama corretamente.",
      imagem_antes: "/img/game/fases/quarto/objetos/camaAntes.png",
      imagem_depois: "/img/game/fases/quarto/objetos/camaDepois.svg",
      posicao_left: "14.5%",
      posicao_top: "37.5%",
      largura: "21%",
      altura: null,
      estrela_left: "24%",
      estrela_top: "50.8%",
      ativa: true
    },
    {
      id_fase: faseQuarto.id,
      nome: "Abrir a janela",
      slug: "janela",
      ordem_acao: 2,
      pergunta: "Qual é a ação correta?",
      mensagem_acerto: "Você abriu a janela corretamente.",
      imagem_antes: "/img/game/fases/quarto/objetos/janelaAntes.svg",
      imagem_depois: "/img/game/fases/quarto/objetos/janelaDepois.svg",
      posicao_left: "16%",
      posicao_top: "6%",
      largura: "30%",
      altura: null,
      estrela_left: "29%",
      estrela_top: "15%",
      ativa: true
    },
    {
      id_fase: faseQuarto.id,
      nome: "Trocar de roupa",
      slug: "armario",
      ordem_acao: 3,
      pergunta: "Qual é a ação correta?",
      mensagem_acerto: "Você trocou de roupa corretamente.",
      imagem_antes: "/img/game/fases/quarto/objetos/armarioAntes.svg",
      imagem_depois: "/img/game/fases/quarto/objetos/armarioDepois.svg",
      posicao_left: "50.5%",
      posicao_top: "25%",
      largura: "30%",
      altura: "50%",
      estrela_left: "65.5%",
      estrela_top: "31%",
      ativa: true
    },
    {
      id_fase: faseQuarto.id,
      nome: "Guardar livro",
      slug: "mesa_livros",
      ordem_acao: 4,
      pergunta: "Qual é a ação correta?",
      mensagem_acerto: "Você guardou o livro corretamente.",
      imagem_antes: "/img/game/fases/quarto/objetos/mesaLivrosAntes.svg",
      imagem_depois: "/img/game/fases/quarto/objetos/mesaLivrosDepois.svg",
      posicao_left: "3.5%",
      posicao_top: "45%",
      largura: "8.5%",
      altura: null,
      estrela_left: "3.4%",
      estrela_top: "43%",
      ativa: true
    }
  ];

  for (const acao of acoesQuarto) {
    await Acao.findOrCreate({
      where: {
        id_fase: acao.id_fase,
        slug: acao.slug
      },
      defaults: acao
    });
  }
}