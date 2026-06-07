function verificarLogin(req, res, next) {
  if (!req.session || !req.session.usuarioLogado) {
    return res.redirect("/game");
  }

  next();
}

export default verificarLogin;