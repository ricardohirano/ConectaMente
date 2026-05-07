import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Crianca from "./criancas.js";
import Fase from "./fase.js";

const ProgressoFase = connection.define("progresso_fases", {
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

Crianca.hasMany(ProgressoFase, { foreignKey: "id_crianca" });
ProgressoFase.belongsTo(Crianca, { foreignKey: "id_crianca" });

Fase.hasMany(ProgressoFase, { foreignKey: "id_fase" });
ProgressoFase.belongsTo(Fase, { foreignKey: "id_fase" });

ProgressoFase.sync({ force: false });

export default ProgressoFase;