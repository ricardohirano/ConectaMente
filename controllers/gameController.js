import Usuario from "../models/usuario.js";
import bcrypt from "bcryptjs";

const abrirGame = (req, res) => {
  res.render("game/index");
};

const abrirCriarConta = (req, res) => {
  res.render("game/criar-conta");
};

const cadastrarConta = async (req, res) => {
  const { nome, email, senha, confirmarSenha } = req.body;

  try {
    if (senha !== confirmarSenha) {
      return res.redirect("/game/criar-conta?erro=senha");
    }

    const usuarioExistente = await Usuario.findOne({
      where: { email: email }
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

    res.redirect("/game");
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro ao cadastrar conta.");
  }
};

export default {
  abrirGame,
  abrirCriarConta,
  cadastrarConta
};