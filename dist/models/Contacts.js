"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const Sequelize_1 = require("../utils/Sequelize");
class Contacts extends sequelize_1.Model {
}
Contacts.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        unique: true
    },
    phoneNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    linkedId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    linkPrecedence: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: Sequelize_1.default,
    modelName: 'contacts',
    timestamps: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true
});
Sequelize_1.default.sync({ alter: true })
    .then(() => {
    console.log('Database synchronized successfully');
})
    .catch((error) => {
    console.error('Error synchronizing database:', error);
});
exports.default = Contacts;
