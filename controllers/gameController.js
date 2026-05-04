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

export default router;