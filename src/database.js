const Database = require("better-sqlite3")
const path = require("path");
const dbpath = path.resolve("./database/GestorHorario.db");
const db = new Database(dbpath, { fileMustExist: true }); //Conexion a la base de datos

module.exports = db;