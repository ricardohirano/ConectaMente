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

  try {
    if (senha !== confirmarSenha) {
      return res.redirect("/game/criar-conta?erro=senha");
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
      senha: senhaHash
    });

    return res.redirect("/game/carregar-conta");
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
      return res.redirect("/game/carregar-conta?erro=email");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.redirect("/game/carregar-conta?erro=senha");
    }

    return res.redirect(`/game/perfil/${usuario.id}`);
  } catch (error) {
    console.log("Ocorreu um erro ao fazer login. " + error);
    return res.redirect("/game/carregar-conta?erro=servidor");
  }
});

export default router;