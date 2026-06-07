import Usuario from "../models/usuario.js";

async function verificarLimiteTempo(req, res, next) {
  try {
    if (!req.session || !req.session.criancaLogada) {
      return next();
    }

    const { id_usuario, hora_inicio } = req.session.criancaLogada;

    const usuario = await Usuario.findByPk(id_usuario);

    if (!usuario) {
      return req.session.destroy(() => {
        return res.redirect("/game");
      });
    }

    const limite = Number(usuario.limite_tempo_diario || 0);

    if (limite === 0) {
      return next();
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

    const inicioSessao = new Date(hora_inicio);
    const agora = new Date();

    const minutosSessao = Math.floor((agora - inicioSessao) / 60000);
    const tempoTotalHoje = Number(usuario.tempo_usado_hoje || 0) + minutosSessao;

    console.log("LIMITE:", limite);
    console.log("TEMPO USADO HOJE:", usuario.tempo_usado_hoje);
    console.log("MINUTOS SESSAO:", minutosSessao);
    console.log("TEMPO TOTAL HOJE:", tempoTotalHoje);

    if (tempoTotalHoje >= limite) {
      await Usuario.update(
        {
          tempo_usado_hoje: tempoTotalHoje,
          data_controle_tempo: hoje
        },
        {
          where: { id: usuario.id }
        }
      );

      return req.session.destroy(() => {
        return res.redirect("/game?limite=atingido");
      });
    }

    next();
  } catch (error) {
    console.log("Erro ao verificar limite de tempo:", error);
    return res.redirect("/game");
  }
}

export default verificarLimiteTempo;