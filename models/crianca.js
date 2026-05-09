import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Usuario from "./usuario.js";

const Crianca = connection.define("criancas", {
  id_usuario: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "id"
    }
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
  },
  total_estrelas: {
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0
  }
});

Usuario.hasOne(Crianca, {
  foreignKey: "id_usuario"
});

Crianca.belongsTo(Usuario, {
  foreignKey: "id_usuario"
});



export default Crianca;