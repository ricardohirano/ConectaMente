import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Crianca from "./crianca.js";
import Fase from "./fase.js";

const RelatorioFase = connection.define("relatorios_fase", {
  id_crianca: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Crianca,
      key: "id"
    }
  },
  id_fase: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Fase,
      key: "id"
    }
  },
  dificuldade: {
    type: Sequelize.STRING,
    allowNull: false
  },
  tentativas_total: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  erros_resposta: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  erros_ordem: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  acoes_concluidas: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  estrelas_ganhas: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  data_inicio: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  data_fim: {
    type: Sequelize.DATE,
    allowNull: true
  }
});

Crianca.hasMany(RelatorioFase, { foreignKey: "id_crianca" });
RelatorioFase.belongsTo(Crianca, { foreignKey: "id_crianca" });

Fase.hasMany(RelatorioFase, { foreignKey: "id_fase" });
RelatorioFase.belongsTo(Fase, { foreignKey: "id_fase" });

export default RelatorioFase;