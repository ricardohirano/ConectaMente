import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Acao from "./acao.js";

const OpcaoResposta = connection.define("opcoes_resposta", {
  id_acao: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Acao,
      key: "id"
    }
  },
  resposta: {
    type: Sequelize.STRING,
    allowNull: false
  },
  correta: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

Acao.hasMany(OpcaoResposta, { foreignKey: "id_acao" });
OpcaoResposta.belongsTo(Acao, { foreignKey: "id_acao" });



export default OpcaoResposta;