import Sequelize from "sequelize";

const connection = new Sequelize({
  dialect: "mysql",
  host: "localhost",
  port: 3306, /*mudar para 3306 na fatec  e outros lugares*/
  username: "root",
  password: "",
 database: "conectamente",
  timezone: "-03:00"
});

export default connection;