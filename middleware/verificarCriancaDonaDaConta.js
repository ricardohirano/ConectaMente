function verificarCriancaDonaDaConta(req, res, next) {
  if (!req.session || !req.session.usuarioLogado) {
    return res.redirect("/game");
  }

  if (req.session.usuarioLogado.tipo !== "crianca") {
    return res.redirect("/game");
  }

  const idSessao = String(req.session.usuarioLogado.id);
  const idRota = String(req.params.id || req.params.idUsuario);

  if (idSessao !== idRota) {
    return res.redirect("/game");
  }

  next();
}

export default verificarCriancaDonaDaConta;