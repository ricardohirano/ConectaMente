import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Fase from "./fase.js";

const Acao = connection.define("acoes", {
  id_fase: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Fase,
      key: "id"
    }
  },
  nome: {
    type: Sequelize.STRING,
    allowNull: false
  },
  pergunta: {
    type: Sequelize.STRING,
    allowNull: false
  },
  objeto_alvo: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ordem_correta: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  imagem_sprite: {
    type: Sequelize.STRING,
    allowNull: true
  },
  estrelas_recompensa: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
});

Fase.hasMany(Acao, { foreignKey: "id_fase" });
Acao.belongsTo(Fase, { foreignKey: "id_fase" });



export default Acao;