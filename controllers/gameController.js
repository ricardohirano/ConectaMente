import express from "express";
import Usuario from "../models/usuario.js";

const router = express.Router();

// ROTA LOGIN DO JOGO
router.get("/game", (req, res) => {
  res.render("game/login");
});

// ROTA CRIAR CONTA
router.get("/game/criar-conta", (req, res) => {
  res.render("game/criar-conta");
});

// ROTA PERFIL
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

// ROTA RESPONSAVEL
let contasVinculadas = [];

// TELA DO RESPONSÁVEL
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

// TELA CONTAS ACESSÍVEIS
router.get("/game/contas-acessiveis/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/contas", {
    idResponsavel: id,
    contas: contasVinculadas
  });
});

// TELA ADICIONAR CONTA
router.get("/game/adicionar-conta/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/adicionar-conta", {
    idResponsavel: id
  });
});

// CADASTRAR VÍNCULO DE CONTA
router.post("/game/adicionar-conta/:id", async (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  const senha = req.body.senha;

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

    contasVinculadas.push({
  id: usuarioEncontrado.id,
  nome: usuarioEncontrado.nome,
  email: usuarioEncontrado.email,
  avatar: "/img/game/avatar-menino.png",
  permissao_ativa: usuarioEncontrado.permissao_ativa
});

    return res.redirect(`/game/contas-acessiveis/${id}`);
  } catch (error) {
    console.log("Erro ao adicionar conta vinculada: " + error);
    return res.redirect(`/game/adicionar-conta/${id}?erro=servidor`);
  }
});


// TELA ADMINISTRAR CONTA
router.get("/game/administrar-conta/:id", (req, res) => {
  const id = req.params.id;

  const conta = contasVinculadas.find(c => c.id == id);

  res.render("game/administrar-conta", {
    conta: conta
  });
});
// ROTA EXCLUIR CONTA CRIANCA
router.post("/game/excluir-conta/:id", (req, res) => {
  const id = req.params.id;

  contasVinculadas = contasVinculadas.filter(conta => conta.id != id);

  res.redirect("/game/contas-acessiveis/1");
});

//ROTA CRIANCA
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

router.get("/game/contas-acessiveis/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/contas", {
    idResponsavel: id
  });
});

router.get("/game/adicionar-conta/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/adicionar-conta", {
    idResponsavel: id
  });
});

router.get("/game/administrar-conta/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const conta = await Usuario.findByPk(id);

    console.log("Conta carregada:", conta);

    return res.render("game/administrar-conta", {
      conta: conta
    });
  } catch (error) {
    console.log("Erro ao carregar conta: " + error);
    return res.redirect("/game");
  }
});
router.get("/game/ativar-conta/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Usuario.update(
      { permissao_ativa: true },
      { where: { id: id } }
    );

    return res.redirect(`/game/administrar-conta/${id}`);
  } catch (error) {
    console.log("Erro ao ativar conta: " + error);
    return res.redirect("/game");
  }
});
router.get("/game/desativar-conta/:id", async (req, res) => {
  const id = req.params.id;

  try {
    await Usuario.update(
      { permissao_ativa: false },
      { where: { id: id } }
    );

    return res.redirect(`/game/administrar-conta/${id}`);
  } catch (error) {
    console.log("Erro ao desativar conta: " + error);
    return res.redirect("/game");
  }
});
export default router;