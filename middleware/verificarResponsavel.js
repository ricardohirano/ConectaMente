function verificarResponsavel(req, res, next) {
  if (!req.session || !req.session.usuarioLogado) {
    return res.redirect("/game");
  }

  if (req.session.usuarioLogado.tipo !== "responsavel") {
    return res.redirect("/game");
  }

  next();
}

export default verificarResponsavel;