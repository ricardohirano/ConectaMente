import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import connection from "./config/sequelize-config.js";
import gameRoutes from "./routes/gameRoutes.js";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

connection.authenticate()
  .then(() => {
    console.log("Conexão com o banco feita com sucesso!");
  })
  .catch((error) => {
    console.log(error);
  });

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/sobre", (req, res) => {
  res.render("sobre");
});

app.get("/equipe", (req, res) => {
  res.render("equipe");
});

app.use("/", gameRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});