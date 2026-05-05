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
router.post("/game/adicionar-conta/:id", (req, res) => {
  const id = req.params.id;
  const email = req.body.email;
  const senha = req.body.senha;

  /*
    Aqui por enquanto vamos apenas simular a conta vinculada.
    Depois isso pode buscar no banco e validar login/ligação real.
  */
  contasVinculadas.push({
    id: contasVinculadas.length + 1,
    nome: "Lorenzo",
    email: email,
    avatar: "/img/game/avatar-menino.png"
  });

  res.redirect(`/game/contas-acessiveis/${id}`);
});

// TELA ADMINISTRAR CONTA
router.get("/game/administrar-conta/:id", (req, res) => {
  const id = req.params.id;

  const conta = contasVinculadas.find(c => c.id == id);

  res.render("game/administrar-conta", {
    conta: conta
  });
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

router.get("/game/administrar-conta/:id", (req, res) => {
  const id = req.params.id;

  res.render("game/administrar-conta", {
    idConta: id
  });
});

export default router;