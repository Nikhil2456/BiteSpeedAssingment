"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('postgres', 'postgres', '1234567', {
    host: 'localhost',
    dialect: 'postgres',
    logging: false
});
exports.default = sequelize;
