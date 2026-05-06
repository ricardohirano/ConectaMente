import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const ProgressoFase = connection.define("progresso_fase", {
  id_crianca: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  nome_comodo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  dificuldade: {
    type: Sequelize.STRING,
    allowNull: false
  },
  concluida: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  estrelas_coletadas: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

ProgressoFase.sync({ force: false });

export default ProgressoFase;