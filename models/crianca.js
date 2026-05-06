import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const Crianca = connection.define("criancas", {
  id_usuario: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  data_nascimento: {
    type: Sequelize.DATEONLY,
    allowNull: true
  },
  avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  nome_avatar: {
    type: Sequelize.STRING,
    allowNull: true
  },
  nivel_progresso: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

Crianca.sync({ force: false });

export default Crianca;