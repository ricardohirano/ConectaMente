import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const ResponsavelCrianca = connection.define("responsavel_crianca", {
  id_responsavel: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  id_crianca: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true
  }
});

ResponsavelCrianca.sync({ force: false });

export default ResponsavelCrianca;