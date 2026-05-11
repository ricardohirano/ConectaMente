import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const Fase = connection.define("fases", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  slug: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  ordem_fase: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  imagem_fundo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ativa: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

export default Fase;