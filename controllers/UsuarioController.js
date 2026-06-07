import express from "express";
import bcrypt from "bcryptjs";
import Usuario from "../models/usuario.js";
import ResponsavelCrianca from "../models/ResponsavelCrianca.js";
import Crianca from "../models/crianca.js";

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

    let permissaoAtiva = true;

    if (tipoConta === "crianca") {
      permissaoAtiva = false;
    }

    const novoUsuario = await Usuario.create({
      nome: nome,
      email: email,
      senha: senhaHash,
      tipoConta: tipoConta,
      permissao_ativa: permissaoAtiva,
      limite_tempo_diario: 0,
      tempo_usado_hoje: 0,
      data_controle_tempo: null
    });

    if (tipoConta === "crianca") {
      await Crianca.create({
        id_usuario: novoUsuario.id
      });
    }

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
      return res.redirect("/game?erro=email_nao_cadastrado");
    }

    console.log("USUARIO LOGIN:", usuario.toJSON());

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
    console.log("SENHA CORRETA:", senhaCorreta);

    if (!senhaCorreta) {
      return res.redirect("/game?erro=senha_incorreta");
    }

    if (usuario.tipoConta === "crianca") {
      const vinculoResponsavel = await ResponsavelCrianca.findOne({
        where: {
          id_crianca: usuario.id
        }
      });

      console.log(
        "VINCULO RESPONSAVEL:",
        vinculoResponsavel ? vinculoResponsavel.toJSON() : null
      );
      console.log("PERMISSAO ATIVA:", usuario.permissao_ativa);

      if (!usuario.permissao_ativa) {
        if (!vinculoResponsavel) {
          return res.redirect("/game?erro=criar_responsavel");
        }

        return res.redirect("/game?erro=ativacao_responsavel");
      }

      const hoje = new Date().toISOString().slice(0, 10);

      if (usuario.data_controle_tempo !== hoje) {
        await Usuario.update(
          {
            tempo_usado_hoje: 0,
            data_controle_tempo: hoje
          },
          {
            where: { id: usuario.id }
          }
        );

        usuario.tempo_usado_hoje = 0;
        usuario.data_controle_tempo = hoje;
      }

      req.session.usuarioLogado = {
        id: usuario.id,
        tipo: "crianca"
      };

      req.session.criancaLogada = {
        id_usuario: usuario.id,
        hora_inicio: new Date().toISOString(),
        limite_tempo_diario: Number(usuario.limite_tempo_diario || 0)
      };

      return res.redirect(`/game/crianca/${usuario.id}`);
    }

    if (usuario.tipoConta === "responsavel") {
      req.session.usuarioLogado = {
        id: usuario.id,
        tipo: "responsavel"
      };

      req.session.responsavelLogado = {
        id_usuario: usuario.id
      };

      return res.redirect(`/game/responsavel/${usuario.id}`);
    }

    return res.redirect("/game");
  } catch (error) {
    console.log("Ocorreu um erro ao fazer login. " + error);
    return res.redirect("/game?erro=servidor");
  }
});

export default router;