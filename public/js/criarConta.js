const form = document.getElementById("formCadastro");
const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");

if (form && senha && confirmarSenha) {
  form.addEventListener("submit", function (event) {
    if (senha.value !== confirmarSenha.value) {
      event.preventDefault();
      alert("As senhas não coincidem.");
      senha.value = "";
      confirmarSenha.value = "";
      senha.focus();
    }
  });
}

const params = new URLSearchParams(window.location.search);
const erro = params.get("erro");

if (erro === "email") {
  alert("Já existe uma conta com esse e-mail.");
}

if (erro === "senha") {
  alert("As senhas não coincidem.");
}

if (erro === "servidor") {
  alert("Ocorreu um erro ao criar a conta.");
}

if (erro) {
  window.history.replaceState({}, document.title, window.location.pathname);
}