import express from "express";
import { Op } from "sequelize";
import Usuario from "../models/usuario.js";
import ResponsavelCrianca from "../models/ResponsavelCrianca.js";
import Crianca from "../models/crianca.js";
import ProgressoFase from "../models/ProgressoFase.js";
import Fase from "../models/fase.js"
import SessaoJogo from "../models/sessaoJogo.js";
import RelatorioFase from "../models/relatorioFase.js";
import Acao from "../models/acao.js";
import OpcaoResposta from "../models/opcaoResposta.js";

const router = express.Router();

import bcrypt from "bcryptjs";

// LOGIN
router.get("/game", (req, res) => {
  res.render("game/login", {
    query: req.query
  });
});

// CRIAR CONTA
router.get("/game/criar-conta", (req, res) => {
  res.render("game/criar-conta");
});

// PERFIL
router.get("/game/perfil/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.redirect("/game");
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    if (!crianca) {
      return res.redirect(`/game/crianca/${id}`);
    }

    const registrosProgresso = await ProgressoFase.findAll({
      where: {
        id_crianca: crianca.id
      },
      include: [
        {
          model: Fase
        }
      ]
    });

    const estruturaBase = [
      { comodo: "Quarto", slug: "quarto", icone: "quarto.svg", facil: false, medio: false, dificil: false, liberado: true },
      { comodo: "Banheiro", slug: "banheiro", icone: "banheiro.svg", facil: false, medio: false, dificil: false, liberado: false },
      { comodo: "Cozinha", slug: "cozinha", icone: "cozinha.svg", facil: false, medio: false, dificil: false, liberado: false },
      { comodo: "Sala", slug: "sala", icone: "sala.svg", facil: false, medio: false, dificil: false, liberado: false },
      { comodo: "Extras", slug: "extras", icone: "extras.svg", facil: false, medio: false, dificil: false, liberado: false }
    ];

    const progressoFases = estruturaBase.map(item => ({ ...item }));

    registrosProgresso.forEach(registro => {
      if (!registro.fase) return;

      const fasePerfil = progressoFases.find(f => f.slug === registro.fase.slug);
      if (!fasePerfil) return;

      const dificuldade = String(registro.dificuldade)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (dificuldade === "facil") {
        fasePerfil.facil = !!registro.concluida;
      }

      if (dificuldade === "medio") {
        fasePerfil.medio = !!registro.concluida;
      }

      if (dificuldade === "dificil") {
        fasePerfil.dificil = !!registro.concluida;
      }
    });

    const quartoConcluido = progressoFases[0].facil && progressoFases[0].medio && progressoFases[0].dificil;
    const banheiroConcluido = progressoFases[1].facil && progressoFases[1].medio && progressoFases[1].dificil;
    const cozinhaConcluida = progressoFases[2].facil && progressoFases[2].medio && progressoFases[2].dificil;
    const salaConcluida = progressoFases[3].facil && progressoFases[3].medio && progressoFases[3].dificil;

    progressoFases[1].liberado = quartoConcluido;
    progressoFases[2].liberado = banheiroConcluido;
    progressoFases[3].liberado = cozinhaConcluida;
    progressoFases[4].liberado = salaConcluida;

    const totalEstrelas = crianca.total_estrelas || 0;

    return res.render("game/perfil", {
      usuario,
      crianca,
      totalEstrelas,
      progressoFases
    });
  } catch (error) {
    console.log("Erro ao carregar perfil: " + error);
    return res.redirect("/game");
  }
});


// CRIANÇA
router.get("/game/crianca/:id", async (req, res) => {
  const id = req.params.id;

  try {
    console.log("ENTROU NA ROTA CRIANCA:", id);

    const usuario = await Usuario.findByPk(id);
    console.log("USUARIO:", usuario ? usuario.toJSON() : null);

    if (!usuario) {
      console.log("USUARIO NAO ENCONTRADO");
      return res.redirect("/game");
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });
    console.log("CRIANCA:", crianca ? crianca.toJSON() : null);

    if (!crianca) {
      console.log("CRIANA NAO ENCONTRADA");
      return res.redirect("/game");
    }

    const temNovoJogoCriado = !!crianca?.avatar && !!crianca?.nome_avatar;
    console.log("TEM NOVO JOGO CRIADO:", temNovoJogoCriado);

    let temJogoSalvo = false;

    const sessoesSalvas = await SessaoJogo.findAll({
      where: {
        id_crianca: crianca.id,
        status: "salva"
      }
    });

    console.log("SESSOES SALVAS:", sessoesSalvas.length);

    temJogoSalvo = sessoesSalvas.length > 0;

    console.log("VAI RENDERIZAR game/crianca");

    return res.render("game/crianca", {
      usuario,
      crianca,
      temNovoJogoCriado,
      temJogoSalvo
    });
  } catch (error) {
    console.log("ERRO NA ROTA /game/crianca/:id ->", error);
    return res.redirect("/game");
  }
});

//Rota Responsavel
router.get("/game/responsavel/:id", async (req, res) => {
  const id = req.params.id;
  console.log("ENTROU /game/responsavel/:id ->", id);

  try {
    const usuario = await Usuario.findByPk(id);
    console.log("USUARIO RESPONSAVEL:", usuario ? usuario.toJSON() : null);

    if (!usuario) {
      console.log("RESPONSAVEL NAO ENCONTRADO");
      return res.redirect("/game");
    }

    return res.render("game/responsavel", {
      usuario: usuario
    });
  } catch (error) {
    console.log("ERRO ROTA RESPONSAVEL:", error);
    return res.redirect("/game");
  }
});

// CONTAS ACESSÍVEIS
router.get("/game/contas-acessiveis/:id", async (req, res) => {
  const id = req.params.id;
  console.log("ENTROU /game/contas-acessiveis/:id ->", id);

  try {
    const usuario = await Usuario.findByPk(id);
    console.log("USUARIO CONTAS ACESSIVEIS:", usuario ? usuario.toJSON() : null);

    if (!usuario) {
      console.log("USUARIO NAO ENCONTRADO EM CONTAS ACESSIVEIS");
      return res.redirect("/game");
    }

    const vinculos = await ResponsavelCrianca.findAll({
      where: {
        id_responsavel: id
      }
    });

    console.log("VINCULOS ENCONTRADOS:", vinculos.length);

    const contas = [];

    for (const vinculo of vinculos) {
      const contaUsuario = await Usuario.findByPk(vinculo.id_crianca);
      const contaCrianca = await Crianca.findOne({
        where: {
          id_usuario: vinculo.id_crianca
        }
      });

      if (contaUsuario) {
        contas.push({
          id: contaUsuario.id,
          nome: contaUsuario.nome,
          email: contaUsuario.email,
          avatar: contaCrianca?.avatar
            ? `/img/game/avatars/${contaCrianca.avatar}`
            : "/img/game/avatars/personagem1.svg",
          permissao_ativa: contaUsuario.permissao_ativa
        });
      }
    }

    console.log("CONTAS MONTADAS:", contas);

    return res.render("game/contas", {
      usuario: usuario,
      idResponsavel: id,
      contas: contas
    });
  } catch (error) {
    console.log("ERRO CONTAS ACESSIVEIS:", error);
    return res.redirect("/game");
  }
});
// ADICIONAR CONTA
router.get("/game/adicionar-conta/:id", async (req, res) => {
  const id = req.params.id;
  console.log("ENTROU /game/adicionar-conta/:id ->", id);

  try {
    const usuario = await Usuario.findByPk(id);
    console.log("USUARIO ADICIONAR CONTA:", usuario ? usuario.toJSON() : null);

    if (!usuario) {
      console.log("RESPONSAVEL NAO ENCONTRADO EM ADICIONAR CONTA");
      return res.redirect("/game");
    }

    return res.render("game/adicionar-conta", {
      idResponsavel: id,
      usuario: usuario,
      query: req.query
    });
  } catch (error) {
    console.log("ERRO ADICIONAR CONTA GET:", error);
    return res.redirect("/game");
  }
});

router.post("/game/adicionar-conta/:id", async (req, res) => {
  const idResponsavel = req.params.id;
  const email = req.body.email;
  const senha = req.body.senha;

  try {
    const responsavel = await Usuario.findByPk(idResponsavel);

    if (!responsavel) {
      return res.redirect("/game");
    }

    const usuarioEncontrado = await Usuario.findOne({
      where: {
        email: email,
        tipoConta: "crianca"
      }
    });

    if (!usuarioEncontrado) {
      return res.redirect(`/game/adicionar-conta/${idResponsavel}?erro=crianca`);
    }

    const senhaCorreta = await bcrypt.compare(senha, usuarioEncontrado.senha);

    if (!senhaCorreta) {
      return res.redirect(`/game/adicionar-conta/${idResponsavel}?erro=senha`);
    }

    const vinculoExistente = await ResponsavelCrianca.findOne({
      where: {
        id_crianca: usuarioEncontrado.id
      }
    });

    if (vinculoExistente) {
      return res.redirect(`/game/adicionar-conta/${idResponsavel}?erro=ja_vinculada`);
    }

    await ResponsavelCrianca.create({
      id_responsavel: idResponsavel,
      id_crianca: usuarioEncontrado.id
    });

    return res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
  } catch (error) {
    console.log("Erro ao adicionar conta vinculada: " + error);
    return res.redirect(`/game/adicionar-conta/${idResponsavel}?erro=servidor`);
  }
});

// ADMINISTRAR CONTA
router.get("/game/administrar-conta/:idConta/:idResponsavel", async (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;

  try {
    const conta = await Usuario.findByPk(idConta);

    return res.render("game/administrar-conta", {
      conta: conta,
      idResponsavel: idResponsavel
    });
  } catch (error) {
    console.log("Erro ao carregar conta: " + error);
    return res.redirect("/game");
  }
});

// ATIVAR CONTA
router.get("/game/ativar-conta/:idConta/:idResponsavel", async (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;

  try {
    await Usuario.update(
      { permissao_ativa: true },
      { where: { id: idConta } }
    );

    return res.redirect(`/game/administrar-conta/${idConta}/${idResponsavel}`);
  } catch (error) {
    console.log("Erro ao ativar conta: " + error);
    return res.redirect("/game");
  }
});
router.post("/game/limite-tempo/:idConta/:idResponsavel", async (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;
  const limite = req.body.limite;

  try {
    await Usuario.update(
      { limite_tempo_diario: limite },
      { where: { id: idConta } }
    );

    return res.redirect(`/game/administrar-conta/${idConta}/${idResponsavel}`);
  } catch (error) {
    console.log("Erro ao salvar limite de tempo: " + error);
    return res.redirect("/game");
  }
});
// DESATIVAR CONTA
router.get("/game/desativar-conta/:idConta/:idResponsavel", async (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;

  try {
    await Usuario.update(
      { permissao_ativa: false },
      { where: { id: idConta } }
    );

    return res.redirect(`/game/administrar-conta/${idConta}/${idResponsavel}`);
  } catch (error) {
    console.log("Erro ao desativar conta: " + error);
    return res.redirect("/game");
  }
});

// EXCLUIR CONTA VINCULADA
router.post("/game/excluir-conta/:idConta/:idResponsavel", async (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;

  try {
    await ResponsavelCrianca.destroy({
      where: {
        id_responsavel: idResponsavel,
        id_crianca: idConta
      }
    });

    return res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
  } catch (error) {
    console.log("Erro ao excluir vínculo da conta: " + error);
    return res.redirect("/game");
  }
});

// ROTA ESCOLHA-PERSONAGEM

router.get("/game/escolha-personagem/:id", async (req, res) => {
  const id = req.params.id;
  const origem = req.query.origem;

  try {
    const usuario = await Usuario.findByPk(id);
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    return res.render("game/escolha-personagem", {
      usuario: usuario,
      crianca: crianca,
      origem: origem || "novo-jogo"
    });
  } catch (error) {
    console.log("Erro ao carregar escolha de personagem: " + error);
    return res.redirect("/game");
  }
});

router.post("/game/escolha-personagem/:id", async (req, res) => {
  const id = req.params.id;
  const avatarEscolhido = req.body.avatarEscolhido;
  const nomeAvatar = req.body.nomeAvatar;
  const origem = req.body.origem;

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    if (!crianca) {
      return res.redirect(`/game/escolha-personagem/${id}`);
    }

    await Crianca.update(
      {
        avatar: avatarEscolhido,
        nome_avatar: nomeAvatar
      },
      {
        where: {
          id_usuario: id
        }
      }
    );

    if (origem === "novo-jogo") {
      return res.redirect(`/game/fase/${id}/quarto/facil`);
    }

    if (origem === "perfil") {
      return res.redirect(`/game/perfil/${id}`);
    }

    return res.redirect(`/game/crianca/${id}`);
  } catch (error) {
    console.log("Erro ao salvar avatar e nome do avatar: " + error);
    return res.redirect(`/game/escolha-personagem/${id}`);
  }
});

//Rota fase
router.get("/game/fase/:idUsuario/:slug/:dificuldade", async (req, res) => {
  const { idUsuario, slug, dificuldade } = req.params;

  try {
    const usuario = await Usuario.findByPk(idUsuario);

    if (!usuario) {
      return res.redirect("/game");
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.redirect("/game");
    }

    const fase = await Fase.findOne({
      where: {
        slug: slug,
        ativa: true
      },
      include: [
        {
          model: Acao,
          where: {
            ativa: true
          },
          required: false,
          include: [
            {
              model: OpcaoResposta,
              required: false
            }
          ]
        }
      ],
      order: [
        [Acao, "ordem_acao", "ASC"],
        [Acao, OpcaoResposta, "ordem_exibicao", "ASC"]
      ]
    });

    if (!fase) {
      return res.redirect(`/game/perfil/${idUsuario}`);
    }

    return res.render(`game/fases/${slug}`, {
      usuario,
      crianca,
      fase,
      dificuldade
    });
  } catch (error) {
    console.log("Erro ao carregar fase: " + error);
    return res.redirect("/game");
  }
});

//ROTA JOGOS SALVOS

router.get("/game/jogos-salvos/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.redirect("/game");
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    if (!crianca) {
      return res.redirect(`/game/crianca/${id}`);
    }

    const sessoes = await SessaoJogo.findAll({
      where: {
        id_crianca: crianca.id,
        status: "salva"
      },
      order: [["updatedAt", "DESC"]]
    });

    return res.render("game/jogos-salvos", {
      usuario,
      crianca,
      sessoes
    });
  } catch (error) {
    console.log("Erro ao carregar jogos salvos: " + error);
    return res.redirect("/game");
  }
});

//Rota salvar sessao

router.post("/game/salvar-sessao/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;
  const {
    nomeSessao,
    slugFase,
    dificuldade,
    acaoAtual,
    estrelasAcumuladas,
    dadosEstado
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Criança não encontrada."
      });
    }

    const fase = await Fase.findOne({
      where: {
        slug: slugFase
      }
    });

    if (!fase) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Fase não encontrada."
      });
    }

    await SessaoJogo.create({
      id_crianca: crianca.id,
      nome_sessao: nomeSessao || "Jogo salvo",
      id_fase_atual: fase.id,
      slug_fase: slugFase,
      avatar_salvo: crianca.avatar,
      nome_avatar_salvo: crianca.nome_avatar,
      dificuldade_atual: dificuldade,
      acao_atual: acaoAtual,
      estrelas_acumuladas: Number(estrelasAcumuladas) || 0,
      dados_estado: JSON.stringify(dadosEstado || {}),
      status: "salva",
      data_ultima_acao: new Date()
    });

    return res.json({
      sucesso: true,
      mensagem: "Sessão salva com sucesso."
    });
  } catch (error) {
    console.log("Erro ao salvar sessão: " + error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao salvar sessão."
    });
  }
});

// rota carregar sessao
router.get("/game/carregar-sessao/:idUsuario/:idSessao", async (req, res) => {
  const { idUsuario, idSessao } = req.params;

  try {
    const sessao = await SessaoJogo.findByPk(idSessao);

    if (!sessao) {
      return res.redirect(`/game/jogos-salvos/${idUsuario}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (crianca) {
      await Crianca.update(
        {
          avatar: sessao.avatar_salvo || crianca.avatar,
          nome_avatar: sessao.nome_avatar_salvo || crianca.nome_avatar
        },
        {
          where: {
            id: crianca.id
          }
        }
      );
    }

    return res.redirect(`/game/fase/${idUsuario}/${sessao.slug_fase}/${sessao.dificuldade_atual}`);
  } catch (error) {
    console.log("Erro ao carregar sessão: " + error);
    return res.redirect(`/game/jogos-salvos/${idUsuario}`);
  }
});
// rota escolha save

router.get("/game/escolher-save/:idUsuario/:slug/:dificuldade", async (req, res) => {
  const { idUsuario, slug, dificuldade } = req.params;

  try {
    const usuario = await Usuario.findByPk(idUsuario);

    if (!usuario) {
      return res.redirect("/game");
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.redirect(`/game/crianca/${idUsuario}`);
    }

    const sessoes = await SessaoJogo.findAll({
      where: {
        id_crianca: crianca.id,
        status: "salva"
      },
      order: [["updatedAt", "DESC"]]
    });

    return res.render("game/escolher-save", {
      usuario,
      crianca,
      sessoes,
      slug,
      dificuldade
    });
  } catch (error) {
    console.log("Erro ao carregar tela de escolher save: " + error);
    return res.redirect("/game");
  }
});
//rota novo save
router.post("/game/criar-save/:idUsuario", async (req, res) => {
  const { idUsuario } = req.params;

  const {
    nomeSessao,
    slugFase,
    dificuldade,
    acaoAtual,
    estrelasAcumuladas,
    dadosEstado,
    tempo_total_minutos,
    data_inicio,
    data_ultima_acao
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Criança não encontrada."
      });
    }

    const fase = await Fase.findOne({
      where: {
        slug: slugFase
      }
    });

    if (!fase) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Fase não encontrada."
      });
    }

    const totalSaves = await SessaoJogo.count({
      where: {
        id_crianca: crianca.id
      }
    });

    const nomeGerado = `Save ${totalSaves + 1}`;

    const novaSessao = await SessaoJogo.create({
      id_crianca: crianca.id,
      nome_sessao: nomeSessao || nomeGerado,
      id_fase_atual: fase.id,
      slug_fase: slugFase,
      nome_avatar_salvo: crianca.nome_avatar,
      avatar_salvo: crianca.avatar,
      dificuldade_atual: dificuldade,
      acao_atual: acaoAtual,
      estrelas_acumuladas: Number(estrelasAcumuladas) || 0,
      dados_estado: JSON.stringify(dadosEstado || {}),
      status: "salva",
      data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
      data_ultima_acao: data_ultima_acao ? new Date(data_ultima_acao) : new Date(),
      tempo_total_minutos: Number(tempo_total_minutos) || 0
    });

    return res.json({
      sucesso: true,
      mensagem: "Save criado com sucesso.",
      sessao: novaSessao
    });
  } catch (error) {
    console.log("Erro ao criar save: " + error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao criar save."
    });
  }
});
// rota save antigo
router.post("/game/sobrescrever-save/:idUsuario/:idSessao", async (req, res) => {
  const { idUsuario, idSessao } = req.params;

  const {
    nomeSessao,
    slugFase,
    dificuldade,
    acaoAtual,
    estrelasAcumuladas,
    dadosEstado,
    tempo_total_minutos,
    data_inicio,
    data_ultima_acao
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Criança não encontrada."
      });
    }

    const fase = await Fase.findOne({
      where: {
        slug: slugFase
      }
    });

    if (!fase) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Fase não encontrada."
      });
    }

    const sessao = await SessaoJogo.findOne({
      where: {
        id: idSessao,
        id_crianca: crianca.id
      }
    });

    if (!sessao) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Sessão não encontrada."
      });
    }

    await SessaoJogo.update(
      {
        nome_sessao: nomeSessao || sessao.nome_sessao,
        id_fase_atual: fase.id,
        slug_fase: slugFase,
        nome_avatar_salvo: crianca.nome_avatar,
        avatar_salvo: crianca.avatar,
        dificuldade_atual: dificuldade,
        acao_atual: acaoAtual,
        estrelas_acumuladas: Number(estrelasAcumuladas) || 0,
        dados_estado: JSON.stringify(dadosEstado || {}),
        status: "salva",
        data_inicio: data_inicio ? new Date(data_inicio) : sessao.data_inicio,
        data_ultima_acao: data_ultima_acao ? new Date(data_ultima_acao) : new Date(),
        tempo_total_minutos: Number(tempo_total_minutos) || 0
      },
      {
        where: {
          id: idSessao,
          id_crianca: crianca.id
        }
      }
    );

    return res.json({
      sucesso: true,
      mensagem: "Save sobrescrito com sucesso."
    });
  } catch (error) {
    console.log("Erro ao sobrescrever save: " + error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao sobrescrever save."
    });
  }
});

//ROTA EXCLUIR SESSAO
router.post("/game/excluir-sessao/:idUsuario/:idSessao", async (req, res) => {
  const { idUsuario, idSessao } = req.params;

  try {
    await SessaoJogo.destroy({
      where: {
        id: idSessao
      }
    });

    return res.redirect(`/game/jogos-salvos/${idUsuario}`);
  } catch (error) {
    console.log("Erro ao excluir sessão: " + error);
    return res.redirect(`/game/jogos-salvos/${idUsuario}`);
  }
});

//rota salvarRessultadofase
router.post("/game/concluir-fase/:idUsuario/:slug/:dificuldade", async (req, res) => {
  const { idUsuario, slug, dificuldade } = req.params;

  const {
    tentativas_total,
    erros_resposta,
    erros_ordem,
    acoes_concluidas,
    estrelas_ganhas,
    tempo_total_minutos,
    data_inicio,
    data_fim
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idUsuario
      }
    });

    if (!crianca) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Criança não encontrada."
      });
    }

    const fase = await Fase.findOne({
      where: {
        slug: slug
      }
    });

    if (!fase) {
      return res.status(404).json({
        sucesso: false,
        mensagem: "Fase não encontrada."
      });
    }

    await RelatorioFase.create({
      id_crianca: crianca.id,
      id_fase: fase.id,
      dificuldade: dificuldade,
      tentativas_total: Number(tentativas_total) || 0,
      erros_resposta: Number(erros_resposta) || 0,
      erros_ordem: Number(erros_ordem) || 0,
      acoes_concluidas: Number(acoes_concluidas) || 0,
      estrelas_ganhas: Number(estrelas_ganhas) || 0,
      tempo_total_minutos: Number(tempo_total_minutos) || 0,
      data_inicio: data_inicio ? new Date(data_inicio) : new Date(),
      data_fim: data_fim ? new Date(data_fim) : new Date()
    });

    await Crianca.update(
      {
        total_estrelas: Number(crianca.total_estrelas || 0) + Number(estrelas_ganhas || 0)
      },
      {
        where: {
          id: crianca.id
        }
      }
    );

    return res.json({
      sucesso: true
    });
  } catch (error) {
    console.log("Erro ao concluir fase: " + error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao salvar relatório da fase."
    });
  }
});
// rota de rendimento 
router.get("/game/rendimento-crianca/:idCrianca/:idResponsavel", async (req, res) => {
  const { idCrianca, idResponsavel } = req.params;

  try {
    const usuario = await Usuario.findByPk(idCrianca);

    if (!usuario) {
      return res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idCrianca
      }
    });

    if (!crianca) {
      return res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
    }

    return res.render("game/rendimento-crianca", {
      usuario,
      crianca,
      idResponsavel
    });
  } catch (error) {
    console.log("Erro ao carregar tela de rendimento da criança: " + error);
    return res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
  }
});
// rota resumo-atividade
router.get("/game/resumo-atividade/:idCrianca/:idResponsavel", async (req, res) => {
  const { idCrianca, idResponsavel } = req.params;

  try {
    const usuario = await Usuario.findByPk(idCrianca);

    if (!usuario) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idCrianca
      }
    });

    if (!crianca) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const totalSessoes = await SessaoJogo.count({
      where: {
        id_crianca: crianca.id
      }
    });

    const totalEstrelas = crianca.total_estrelas || 0;

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const relatoriosSemana = await RelatorioFase.findAll({
      where: {
        id_crianca: crianca.id,
        createdAt: {
          [Op.gte]: seteDiasAtras
        }
      }
    });

    let frequenciaSemanal = 0;

    relatoriosSemana.forEach(relatorio => {
      frequenciaSemanal += Number(relatorio.tempo_total_minutos || 0);
    });

    return res.render("game/resumo-atividade", {
      usuario,
      crianca,
      idResponsavel,
      totalSessoes,
      totalEstrelas,
      frequenciaSemanal
    });
  } catch (error) {
    console.log("Erro ao carregar resumo de atividade: " + error);
    return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
  }
});
// Rota Rendimento Final

router.get("/game/relatorio-final/:idCrianca/:idResponsavel", async (req, res) => {
  const { idCrianca, idResponsavel } = req.params;

  try {
    const usuario = await Usuario.findByPk(idCrianca);

    if (!usuario) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idCrianca
      }
    });

    if (!crianca) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const fases = await Fase.findAll({
      order: [["ordem_fase", "ASC"]]
    });

    const relatorios = await RelatorioFase.findAll({
      where: {
        id_crianca: crianca.id
      },
      include: [
        {
          model: Fase
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const totalEstrelas = Number(crianca.total_estrelas || 0);

    let totalCorretas = 0;
    let totalIncorretas = 0;
    let totalMinutos = 0;

    relatorios.forEach((relatorio) => {
      totalCorretas += Number(relatorio.acoes_concluidas || 0);
      totalIncorretas += Number(relatorio.erros_resposta || 0) + Number(relatorio.erros_ordem || 0);
      totalMinutos += Number(relatorio.tempo_total_minutos || 0);
    });

    const totalRespostas = totalCorretas + totalIncorretas;
    const percentualAcerto = totalRespostas > 0
      ? Math.round((totalCorretas / totalRespostas) * 100)
      : 0;

    const mediaTempo = relatorios.length > 0
      ? Math.round(totalMinutos / relatorios.length)
      : 0;

    const progressoLabels = [];
    const progressoValores = [];

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      progressoLabels.push(String(dia).padStart(2, "0"));
      progressoValores.push(0);
    }

    relatorios.forEach((relatorio) => {
      const data = new Date(relatorio.createdAt);
      if (data.getMonth() === mes && data.getFullYear() === ano) {
        const dia = data.getDate();
        progressoValores[dia - 1] += Number(relatorio.acoes_concluidas || 0);
      }
    });

    const statusFases = fases.map((fase) => {
      const relatoriosDaFase = relatorios.filter((r) => r.id_fase === fase.id);

      if (relatoriosDaFase.length === 0) {
        return {
          nome: fase.nome,
          data: "--",
          status: "nao_comecou",
          dificuldade: ""
        };
      }

      const maisRecente = relatoriosDaFase[0];
      const concluiu = Number(maisRecente.acoes_concluidas || 0) > 0;

      return {
        nome: fase.nome,
        data: new Date(maisRecente.updatedAt || maisRecente.createdAt).toLocaleDateString("pt-BR"),
        status: concluiu ? "concluido" : "em_andamento",
        dificuldade: maisRecente.dificuldade || ""
      };
    });

    return res.render("game/relatorio-final-crianca", {
      usuario,
      crianca,
      idResponsavel,
      totalEstrelas,
      percentualAcerto,
      mediaTempo,
      progressoLabels,
      progressoValores,
      statusFases
    });
  } catch (error) {
    console.log("Erro ao carregar relatório final: " + error);
    return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
  }
});
// rota percentual
router.get("/game/percentual-acerto/:idCrianca/:idResponsavel", async (req, res) => {
  const { idCrianca, idResponsavel } = req.params;

  try {
    const usuario = await Usuario.findByPk(idCrianca);

    if (!usuario) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idCrianca
      }
    });

    if (!crianca) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const relatorios = await RelatorioFase.findAll({
      where: {
        id_crianca: crianca.id
      }
    });

    let totalCorretas = 0;
    let totalIncorretas = 0;

    relatorios.forEach((relatorio) => {
      totalCorretas += Number(relatorio.acoes_concluidas || 0);
      totalIncorretas +=
        Number(relatorio.erros_resposta || 0) +
        Number(relatorio.erros_ordem || 0);
    });

    const totalRespostas = totalCorretas + totalIncorretas;

    const percentualAcerto =
      totalRespostas > 0
        ? Math.round((totalCorretas / totalRespostas) * 100)
        : 0;

    return res.render("game/percentual-acerto", {
      usuario,
      crianca,
      idResponsavel,
      totalCorretas,
      totalIncorretas,
      percentualAcerto
    });
  } catch (error) {
    console.log("Erro ao carregar percentual de acerto: " + error);
    return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
  }
});

//rota evolucao da crianca
router.get("/game/evolucao-progresso/:idCrianca/:idResponsavel", async (req, res) => {
  const { idCrianca, idResponsavel } = req.params;

  try {
    const usuario = await Usuario.findByPk(idCrianca);

    if (!usuario) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const crianca = await Crianca.findOne({
      where: {
        id_usuario: idCrianca
      }
    });

    if (!crianca) {
      return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
    }

    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const inicioMes = new Date(ano, mes, 1, 0, 0, 0, 0);
    const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59, 999);

    const relatorios = await RelatorioFase.findAll({
      where: {
        id_crianca: crianca.id,
        createdAt: {
          [Op.between]: [inicioMes, fimMes]
        }
      },
      order: [["createdAt", "ASC"]]
    });

    const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();

    const labels = [];
    const progressoDiario = [];

    for (let dia = 1; dia <= ultimoDiaDoMes; dia++) {
      labels.push(String(dia).padStart(2, "0"));
      progressoDiario.push(0);
    }

    relatorios.forEach((relatorio) => {
      const data = new Date(relatorio.createdAt);
      const dia = data.getDate();

      progressoDiario[dia - 1] += Number(relatorio.acoes_concluidas || 0);
    });

    return res.render("game/evolucao-progresso", {
      usuario,
      crianca,
      idResponsavel,
      labels,
      progressoSemanal: progressoDiario
    });
  } catch (error) {
    console.log("Erro ao carregar evolução do progresso: " + error);
    return res.redirect(`/game/rendimento-crianca/${idCrianca}/${idResponsavel}`);
  }
});
export default router;