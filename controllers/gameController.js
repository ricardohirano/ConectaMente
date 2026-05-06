import express from "express";
import Usuario from "../models/usuario.js";

const router = express.Router();

let contasVinculadas = [];

// LOGIN
router.get("/game", (req, res) => {
  res.render("game/login");
});

// CRIAR CONTA
router.get("/game/criar-conta", (req, res) => {
  res.render("game/criar-conta");
});

// PERFIL
router.get("/game/perfil/:id", (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id).then(usuario => {
    res.render("game/perfil", {
      usuario: usuario
    });
  }).catch(error => {
    console.log("Ocorreu um erro ao carregar o perfil. " + error);
    res.redirect("/game");
  });
});

// RESPONSÁVEL
router.get("/game/responsavel/:id", (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id).then(usuario => {
    res.render("game/responsavel", {
      usuario: usuario
    });
  }).catch(error => {
    console.log("Ocorreu um erro ao carregar a tela do responsável. " + error);
    res.redirect("/game");
  });
});

// CRIANÇA
router.get("/game/crianca/:id", (req, res) => {
  const id = req.params.id;

  Usuario.findByPk(id).then(usuario => {
    res.render("game/crianca", {
      usuario: usuario
    });
  }).catch(error => {
    console.log("Ocorreu um erro ao carregar a tela da criança. " + error);
    res.redirect("/game");
  });
});

// CONTAS ACESSÍVEIS
router.get("/game/contas-acessiveis/:id", (req, res) => {
  const id = req.params.id;

  const contasDoResponsavel = contasVinculadas.filter(conta => conta.idResponsavel == id);

  res.render("game/contas", {
    idResponsavel: id,
    contas: contasDoResponsavel
  });
});

// ADICIONAR CONTA
router.get("/game/adicionar-conta/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/adicionar-conta", {
    idResponsavel: id
  });
});

router.post("/game/adicionar-conta/:id", async (req, res) => {
  const id = req.params.id;
  const email = req.body.email;

  try {
    const usuarioEncontrado = await Usuario.findOne({
      where: {
        email: email,
        tipoConta: "crianca"
      }
    });

    if (!usuarioEncontrado) {
      return res.redirect(`/game/adicionar-conta/${id}?erro=crianca`);
    }

    const contaJaVinculada = contasVinculadas.find(conta =>
      conta.idResponsavel == id && conta.id == usuarioEncontrado.id
    );

    if (!contaJaVinculada) {
      contasVinculadas.push({
        idResponsavel: id,
        id: usuarioEncontrado.id,
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        avatar: "/img/game/avatar-menino.png",
        permissao_ativa: usuarioEncontrado.permissao_ativa
      });
    }

    return res.redirect(`/game/contas-acessiveis/${id}`);
  } catch (error) {
    console.log("Erro ao adicionar conta vinculada: " + error);
    return res.redirect(`/game/adicionar-conta/${id}?erro=servidor`);
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
router.post("/game/excluir-conta/:idConta/:idResponsavel", (req, res) => {
  const idConta = req.params.idConta;
  const idResponsavel = req.params.idResponsavel;

  contasVinculadas = contasVinculadas.filter(conta =>
    !(conta.idResponsavel == idResponsavel && conta.id == idConta)
  );

  res.redirect(`/game/contas-acessiveis/${idResponsavel}`);
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
export default router;