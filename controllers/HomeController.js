import express from "express";

const router = express.Router();

// ROTA PÁGINA INICIAL
router.get("/", (req, res) => {
  res.render("index");
});

// ROTA SOBRE O JOGO
router.get("/sobre", (req, res) => {
  res.render("sobre");
});

// ROTA EQUIPE
router.get("/equipe", (req, res) => {
  res.render("equipe");
});

export default router;