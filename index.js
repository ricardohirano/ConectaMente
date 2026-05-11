import express from "express";
import connection from "./config/sequelize-config.js";

import HomeController from "./controllers/HomeController.js";
import GameController from "./controllers/GameController.js";
import UsuarioController from "./controllers/UsuarioController.js";


const app = express();


//importando os models
import Usuario from "./models/usuario.js";
import Crianca from "./models/crianca.js";
import ResponsavelCrianca from "./models/ResponsavelCrianca.js";
import Fase from "./models/fase.js";
import Acao from "./models/acao.js";
import OpcaoResposta from "./models/opcaoResposta.js";
import ProgressoFase from "./models/ProgressoFase.js";
import SessaoJogo from "./models/sessaoJogo.js";
import RelatorioFase from "./models/relatorioFase.js";

import popularDadosIniciais from "./utils/popularDadosIniciais.js";



// VIEW ENGINE
app.set("view engine", "ejs");

// ARQUIVOS ESTÁTICOS
app.use(express.static("public"));

// PERMITE RECEBER DADOS DE FORMULÁRIOS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


connection.authenticate().then(async () => {
  console.log("Conexão com o banco de dados feita com sucesso!");

  await Usuario.sync({ force: false });
  await ResponsavelCrianca.sync({ force: false });
  await Crianca.sync({ force: false });
  await Fase.sync({ force: false });
  await Acao.sync({ force: false });
  await OpcaoResposta.sync({ force: false });
  await ProgressoFase.sync({ force: false });
  await SessaoJogo.sync({ force: false });
  await RelatorioFase.sync({ force: false });
  await popularDadosIniciais();

  console.log("Tabelas sincronizadas com sucesso.");
}).catch((error) => {
  console.log("Erro ao conectar no banco de dados: "+error);
});
// CRIANDO O BANCO DE DADOS SE NÃO EXISTIR
connection.query(`CREATE DATABASE IF NOT EXISTS conectamente;`).then(() => {
  console.log("O banco de dados está criado.");
}).catch((error) => {
  console.log("Erro ao criar o banco de dados: " + error);
});

// CONTROLLERS
app.use("/", HomeController);
app.use("/", GameController);
app.use("/", UsuarioController);

// INICIANDO O SERVIDOR
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});