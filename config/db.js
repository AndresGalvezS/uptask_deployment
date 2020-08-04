const { Sequelize } = require('sequelize');
//Extraer valores de la variables.env
require('dotenv').config({path: 'variable.env'});

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASS, {
  host: process.env.BD_HOST,
  port: process.env.BD_PORT,
  dialect: 'mysql' ,/* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
  define:{
      timestamps: false
  },

  pool:{
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
  },
});

module.exports = db;

