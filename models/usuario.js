import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";

const Usuario = connection.define("usuarios", {
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  senha: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tipoConta: {
    type: Sequelize.STRING,
    allowNull: false
  },
  permissao_ativa: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  limite_tempo_diario: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
  
});


export default Usuario;