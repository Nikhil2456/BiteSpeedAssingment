"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('postgres://admin:7et0FeQflDdrUoJxWyZuW4UUuiwkk0QD@dpg-cp8mjvn109ks739tcsog-a.oregon-postgres.render.com/postgre_sohc', {
    dialect: 'postgres',
    logging: false,
    port: 5432,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
exports.default = sequelize;
