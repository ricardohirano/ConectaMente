import express from "express";
import Usuario from "../models/usuario.js";
import ResponsavelCrianca from "../models/ResponsavelCrianca.js";
import Crianca from "../models/criancas.js";
import ProgressoFase from "../models/ProgressoFase.js";
import Fase from "../models/fase.js"

const router = express.Router();



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
      { comodo: "Quarto", slug: "quarto", icone: "icone-quarto.png", ordem: 1, facil: false, medio: false, dificil: false },
      { comodo: "Banheiro", slug: "banheiro", icone: "icone-banheiro.png", ordem: 2, facil: false, medio: false, dificil: false },
      { comodo: "Cozinha", slug: "cozinha", icone: "icone-cozinha.png", ordem: 3, facil: false, medio: false, dificil: false },
      { comodo: "Sala", slug: "sala", icone: "icone-sala.png", ordem: 4, facil: false, medio: false, dificil: false },
      { comodo: "Extras", slug: "extras", icone: "icone-extras.png", ordem: 5, facil: false, medio: false, dificil: false }
    ];

    const progressoFases = estruturaBase.map(item => ({ ...item }));
    let totalEstrelas = 0;

    registrosProgresso.forEach(registro => {
      totalEstrelas += registro.estrelas_coletadas || 0;

      if (!registro.fase) {
        return;
      }

      const fase = progressoFases.find(f => f.slug === registro.fase.slug);

      if (!fase) {
        return;
      }

      const dificuldade = String(registro.dificuldade).trim().toLowerCase();

      if (dificuldade === "fácil" || dificuldade === "facil") {
        fase.facil = !!registro.concluida;
      }

      if (dificuldade === "médio" || dificuldade === "medio") {
        fase.medio = !!registro.concluida;
      }

      if (dificuldade === "difícil" || dificuldade === "dificil") {
        fase.dificil = !!registro.concluida;
      }
    });

    progressoFases.sort((a, b) => a.ordem - b.ordem);

    progressoFases.forEach((fase, index) => {
      fase.concluidoTotal = fase.facil && fase.medio && fase.dificil;

      if (index === 0) {
        fase.liberado = true;
      } else {
        fase.liberado = progressoFases[index - 1].concluidoTotal;
      }
    });

    return res.render("game/perfil", {
      usuario: usuario,
      crianca: crianca,
      totalEstrelas: totalEstrelas,
      progressoFases: progressoFases
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
    const usuario = await Usuario.findByPk(id);
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    const temNovoJogoCriado = !!crianca?.avatar && !!crianca?.nome_avatar;
    const temJogoSalvo = false;

    return res.render("game/crianca", {
      usuario: usuario,
      crianca: crianca,
      temNovoJogoCriado: temNovoJogoCriado,
      temJogoSalvo: temJogoSalvo
    });
  } catch (error) {
    console.log("Ocorreu um erro ao carregar a tela da criança. " + error);
    return res.redirect("/game");
  }
});

//Rota Responsavel
router.get("/game/responsavel/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const usuario = await Usuario.findByPk(id);

    if (!usuario) {
      return res.redirect("/game");
    }

    return res.render("game/responsavel", {
      usuario: usuario
    });
  } catch (error) {
    console.log("Ocorreu um erro ao carregar a tela do responsável. " + error);
    return res.redirect("/game");
  }
});
// CONTAS ACESSÍVEIS
router.get("/game/contas-acessiveis/:id", async (req, res) => {
  const idResponsavel = req.params.id;

  try {
    const vinculos = await ResponsavelCrianca.findAll({
      where: {
        id_responsavel: idResponsavel
      }
    });

    const idsCriancas = vinculos.map(vinculo => vinculo.id_crianca);

    let contas = [];

    if (idsCriancas.length > 0) {
      contas = await Usuario.findAll({
        where: {
          id: idsCriancas
        }
      });
    }

    return res.render("game/contas", {
      idResponsavel: idResponsavel,
      contas: contas
    });
  } catch (error) {
    console.log("Erro ao carregar contas acessíveis: " + error);
    return res.redirect("/game");
  }
});

// ADICIONAR CONTA
router.get("/game/adicionar-conta/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/adicionar-conta", {
    idResponsavel: id,
    query: req.query
  });
});

router.post("/game/adicionar-conta/:id", async (req, res) => {
  const idResponsavel = req.params.id;
  const email = req.body.email;

  try {
    const usuarioEncontrado = await Usuario.findOne({
      where: {
        email: email,
        tipoConta: "crianca"
      }
    });

    if (!usuarioEncontrado) {
      return res.redirect(`/game/adicionar-conta/${idResponsavel}?erro=crianca`);
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

  try {
    const usuario = await Usuario.findByPk(id);
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    return res.render("game/escolha-personagem", {
      usuario: usuario,
      crianca: crianca
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

  console.log("ID usuário:", id);
  console.log("Avatar escolhido:", avatarEscolhido);
  console.log("Nome avatar:", nomeAvatar);

  try {
    const crianca = await Crianca.findOne({
      where: {
        id_usuario: id
      }
    });

    console.log("Registro encontrado em criancas:", crianca);

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

    return res.redirect(`/game/crianca/${id}`);
  } catch (error) {
    console.log("Erro ao salvar avatar e nome do avatar: " + error);
    return res.redirect(`/game/escolha-personagem/${id}`);
  }
});
//Rota fase
router.get("/game/:slug", async (req, res) => {
  const slug = req.params.slug;

  try {
    const fase = await Fase.findOne({
      where: {
        slug: slug
      }
    });

    if (!fase) {
      return res.redirect("/game");
    }

    return res.send(`Fase encontrada: ${fase.nome}`);
  } catch (error) {
    console.log("Erro ao carregar fase: " + error);
    return res.redirect("/game");
  }
});
export default router;