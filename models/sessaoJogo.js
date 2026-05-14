import Sequelize from "sequelize";
import connection from "../config/sequelize-config.js";
import Crianca from "./crianca.js";
import Fase from "./fase.js";

const SessaoJogo = connection.define("sessoes_jogo", {
  id_crianca: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Crianca,
      key: "id"
    }
  },
  nome_sessao: {
    type: Sequelize.STRING,
    allowNull: false
  },
  id_fase_atual: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: Fase,
      key: "id"
    }
  },
  slug_fase: {
    type: Sequelize.STRING,
    allowNull: true
  },
  avatar_salvo: {
  type: Sequelize.STRING,
  allowNull: true
  },
  nome_avatar_salvo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  dificuldade_atual: {
    type: Sequelize.STRING,
    allowNull: true
  },
  acao_atual: {
    type: Sequelize.STRING,
    allowNull: true
  },
  estrelas_acumuladas: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dados_estado: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: "salva"
  },
  data_inicio: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  data_ultima_acao: {
    type: Sequelize.DATE,
    allowNull: true
  },
  tempo_total_minutos: {
  type: Sequelize.INTEGER,
  allowNull: false,
  defaultValue: 0
  }
});

Crianca.hasMany(SessaoJogo, { foreignKey: "id_crianca" });
SessaoJogo.belongsTo(Crianca, { foreignKey: "id_crianca" });

Fase.hasMany(SessaoJogo, { foreignKey: "id_fase_atual" });
SessaoJogo.belongsTo(Fase, { foreignKey: "id_fase_atual" });

export default SessaoJogo;