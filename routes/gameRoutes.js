import express from "express";
import gameController from "../controllers/GameController.js";

const router = express.Router();

router.get("/game", gameController.abrirGame);
router.get("/game/criar-conta", gameController.abrirCriarConta);
router.post("/game/criar-conta", gameController.cadastrarConta);

export default router;