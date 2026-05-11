import express from "express";
import Usuario from "../models/usuario.js";
import ResponsavelCrianca from "../models/ResponsavelCrianca.js";
import Crianca from "../models/crianca.js";
import ProgressoFase from "../models/ProgressoFase.js";
import Fase from "../models/fase.js"
import SessaoJogo from "../models/sessaoJogo.js";
import RelatorioFase from "../models/relatorioFase.js";

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
      return res.redirect(`/game/crianca/${idUsuario}`);
    }

    const fase = await Fase.findOne({
      where: {
        slug: slug
      }
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
      where: { id_usuario: idUsuario }
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
    console.log("Erro ao carregar tela de save: " + error);
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
    dadosEstado
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: { id_usuario: idUsuario }
    });

    const fase = await Fase.findOne({
      where: { slug: slugFase }
    });

    if (!crianca || !fase) {
      return res.status(400).json({ sucesso: false });
    }

    await SessaoJogo.create({
      id_crianca: crianca.id,
      nome_sessao: nomeSessao || "Novo Save",
      id_fase_atual: fase.id,
      slug_fase: slugFase,
      dificuldade_atual: dificuldade,
      acao_atual: acaoAtual,
      estrelas_acumuladas: Number(estrelasAcumuladas) || 0,
      dados_estado: JSON.stringify(dadosEstado || {}),
      status: "salva",
      data_ultima_acao: new Date()
    });

    return res.json({ sucesso: true });
  } catch (error) {
    console.log("Erro ao criar save: " + error);
    return res.status(500).json({ sucesso: false });
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
    dadosEstado
  } = req.body;

  try {
    const crianca = await Crianca.findOne({
      where: { id_usuario: idUsuario }
    });

    const fase = await Fase.findOne({
      where: { slug: slugFase }
    });

    if (!crianca || !fase) {
      return res.status(400).json({ sucesso: false });
    }

    await SessaoJogo.update(
      {
        nome_sessao: nomeSessao || "Jogo salvo",
        id_fase_atual: fase.id,
        slug_fase: slugFase,
        dificuldade_atual: dificuldade,
        acao_atual: acaoAtual,
        estrelas_acumuladas: Number(estrelasAcumuladas) || 0,
        dados_estado: JSON.stringify(dadosEstado || {}),
        status: "salva",
        data_ultima_acao: new Date()
      },
      {
        where: {
          id: idSessao,
          id_crianca: crianca.id
        }
      }
    );

    return res.json({ sucesso: true });
  } catch (error) {
    console.log("Erro ao sobrescrever save: " + error);
    return res.status(500).json({ sucesso: false });
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
    estrelas_ganhas
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

    const estrelasDaRodada = Number(estrelas_ganhas) || 0;

    console.log("DIFICULDADE:", dificuldade);
    console.log("ESTRELAS DA RODADA:", estrelasDaRodada);

    await RelatorioFase.create({
      id_crianca: crianca.id,
      id_fase: fase.id,
      dificuldade: dificuldade,
      tentativas_total: Number(tentativas_total) || 0,
      erros_resposta: Number(erros_resposta) || 0,
      erros_ordem: Number(erros_ordem) || 0,
      acoes_concluidas: Number(acoes_concluidas) || 0,
      estrelas_ganhas: estrelasDaRodada,
      data_fim: new Date()
    });

    await Crianca.increment(
      { total_estrelas: estrelasDaRodada },
      {
        where: {
          id: crianca.id
        }
      }
    );

    const progressoExistente = await ProgressoFase.findOne({
      where: {
        id_crianca: crianca.id,
        id_fase: fase.id,
        dificuldade: dificuldade
      }
    });

    if (progressoExistente) {
      await ProgressoFase.update(
        {
          concluida: true
        },
        {
          where: {
            id: progressoExistente.id
          }
        }
      );
    } else {
      await ProgressoFase.create({
        id_crianca: crianca.id,
        id_fase: fase.id,
        dificuldade: dificuldade,
        concluida: true,
        estrelas_coletadas: estrelasDaRodada
      });
    }

    return res.json({
      sucesso: true,
      mensagem: "Fase concluída com sucesso."
    });
  } catch (error) {
    console.log("Erro ao concluir fase: " + error);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao concluir fase."
    });
  }
});
export default router;