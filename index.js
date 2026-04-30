import express from "express";
import connection from "./config/sequelize-config.js";

import HomeController from "./controllers/HomeController.js";
import GameController from "./controllers/GameController.js";
import UsuarioController from "./controllers/UsuarioController.js";

const app = express();
const port = 3000;

// VIEW ENGINE
app.set("view engine", "ejs");

// ARQUIVOS ESTÁTICOS
app.use(express.static("public"));

// PERMITE RECEBER DADOS DE FORMULÁRIOS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CONEXÃO COM O BANCO
connection.authenticate().then(() => {
  console.log("Conexão com o banco de dados feita com sucesso!");
}).catch((error) => {
  console.log("Erro ao conectar no banco de dados: " + error);
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
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});