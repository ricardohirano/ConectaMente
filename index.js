import express from "express";
import connection from "./config/sequelize-config.js";

import HomeController from "./controllers/HomeController.js";
import GameController from "./controllers/GameController.js";
import UsuarioController from "./controllers/UsuarioController.js";

const app = express();

// View engine
app.set("view engine", "ejs");

// Arquivos estáticos
app.use(express.static("public"));

// Permite receber dados de formulários
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Conexão com o banco
connection.authenticate().then(() => {
  console.log("Conexão com o banco feita com sucesso!");
}).catch((error) => {
  console.log("Erro ao conectar no banco: " + error);
});

// Controllers
app.use("/", HomeController);
app.use("/", GameController);
app.use("/", UsuarioController);

// Servidor
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});