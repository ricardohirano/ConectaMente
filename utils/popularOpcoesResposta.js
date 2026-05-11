import Acao from "../models/acao.js";
import OpcaoResposta from "../models/opcaoResposta.js";

export default async function popularOpcoesResposta() {
  const acoes = await Acao.findAll();

  const mapaOpcoes = {
    cama: [
      { texto_opcao: "Arrumar a cama", correta: true, ordem_exibicao: 1 },
      { texto_opcao: "Deitar na cama", correta: false, ordem_exibicao: 2 },
      { texto_opcao: "Pular na cama", correta: false, ordem_exibicao: 3 },
      { texto_opcao: "Bagunçar o lençol", correta: false, ordem_exibicao: 4 }
    ],
    janela: [
      { texto_opcao: "Abrir a janela", correta: true, ordem_exibicao: 1 },
      { texto_opcao: "Fechar a janela", correta: false, ordem_exibicao: 2 },
      { texto_opcao: "Subir na janela", correta: false, ordem_exibicao: 3 },
      { texto_opcao: "Empurrar a cortina", correta: false, ordem_exibicao: 4 }
    ],
    armario: [
      { texto_opcao: "Trocar de roupa", correta: true, ordem_exibicao: 1 },
      { texto_opcao: "Dormir no armário", correta: false, ordem_exibicao: 2 },
      { texto_opcao: "Brincar no armário", correta: false, ordem_exibicao: 3 },
      { texto_opcao: "Jogar roupa no chão", correta: false, ordem_exibicao: 4 }
    ],
    mesa_livros: [
      { texto_opcao: "Guardar livro", correta: true, ordem_exibicao: 1 },
      { texto_opcao: "Jogar o livro no chão", correta: false, ordem_exibicao: 2 },
      { texto_opcao: "Rasgar o livro", correta: false, ordem_exibicao: 3 },
      { texto_opcao: "Esconder o livro", correta: false, ordem_exibicao: 4 }
    ]
  };

  for (const acao of acoes) {
    const opcoes = mapaOpcoes[acao.slug];
    if (!opcoes) continue;

    for (const opcao of opcoes) {
      await OpcaoResposta.findOrCreate({
        where: {
          id_acao: acao.id,
          texto_opcao: opcao.texto_opcao
        },
        defaults: {
          id_acao: acao.id,
          texto_opcao: opcao.texto_opcao,
          correta: opcao.correta,
          ordem_exibicao: opcao.ordem_exibicao
        }
      });
    }
  }
}