import express from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.js";

const router = express.Router();

// ROTA CADASTRAR USUÁRIO
router.post("/usuarios/new", async (req, res) => {
  const nome = req.body.nome;
  const email = req.body.email;
  const senha = req.body.senha;
  const confirmarSenha = req.body.confirmarSenha;
  const tipoConta = req.body.tipoConta;

  try {
    if (senha !== confirmarSenha) {
      return res.redirect("/game/criar-conta?erro=senha");
    }

    if (!tipoConta) {
      return res.redirect("/game/criar-conta?erro=tipoconta");
    }

    const usuarioExistente = await Usuario.findOne({
      where: {
        email: email
      }
    });

    if (usuarioExistente) {
      return res.redirect("/game/criar-conta?erro=email");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await Usuario.create({
      nome: nome,
      email: email,
      senha: senhaHash,
      tipoConta: tipoConta
    });

    return res.redirect("/game");
  } catch (error) {
    console.log("Ocorreu um erro ao cadastrar o usuário. " + error);
    return res.redirect("/game/criar-conta?erro=servidor");
  }
});

// ROTA LOGIN DE USUÁRIO
router.post("/usuarios/login", async (req, res) => {
  const email = req.body.email;
  const senha = req.body.senha;

  try {
    const usuario = await Usuario.findOne({
      where: {
        email: email
      }
    });

    if (!usuario) {
      return res.redirect("/game?erro=email");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.redirect("/game?erro=senha");
    }

    if (usuario.tipoConta === "responsavel") {
      return res.redirect(`/game/responsavel/${usuario.id}`);
    }

    if (usuario.tipoConta === "crianca") {
      return res.redirect(`/game/crianca/${usuario.id}`);
    }

    return res.redirect("/game");
  } catch (error) {
    console.log("Ocorreu um erro ao fazer login. " + error);
    return res.redirect("/game?erro=servidor");
  }
});

export default router;