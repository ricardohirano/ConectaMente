import express from "express";
import Usuario from "../models/usuario.js";

const router = express.Router();

// ROTA TELA INICIAL DO JOGO
router.get("/game", (req, res) => {
  res.render("game/index");
});

// ROTA TELA CRIAR CONTA
router.get("/game/criar-conta", (req, res) => {
  res.render("game/criar-conta");
});

// ROTA TELA CARREGAR CONTA
router.get("/game/carregar-conta", (req, res) => {
  res.render("game/carregar-conta");
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

export default router;