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
  slug: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ordem_acao: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  pergunta: {
    type: Sequelize.STRING,
    allowNull: false
  },
  mensagem_acerto: {
    type: Sequelize.STRING,
    allowNull: true
  },
  imagem_antes: {
    type: Sequelize.STRING,
    allowNull: false
  },
  imagem_depois: {
    type: Sequelize.STRING,
    allowNull: false
  },
  posicao_top: {
    type: Sequelize.STRING,
    allowNull: true
  },
  posicao_left: {
    type: Sequelize.STRING,
    allowNull: true
  },
  largura: {
    type: Sequelize.STRING,
    allowNull: true
  },
  altura: {
    type: Sequelize.STRING,
    allowNull: true
  },
  estrela_top: {
    type: Sequelize.STRING,
    allowNull: true
  },
  estrela_left: {
    type: Sequelize.STRING,
    allowNull: true
  },
  ativa: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

Fase.hasMany(Acao, { foreignKey: "id_fase" });
Acao.belongsTo(Fase, { foreignKey: "id_fase" });

export default Acao;