"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
exports.sequelize = new sequelize_1.Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: Number(process.env.DB_PORT),
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    define: {
        timestamps: true,
        underscored: false,
        freezeTableName: true
    }
});
const connectDB = async () => {
    try {
        await exports.sequelize.authenticate();
        await exports.sequelize.sync({ alter: true });
        console.log("Database connected successfully");
    }
    catch (err) {
        throw new Error(`Unable to connect to the database: ${err}`);
    }
};
exports.connectDB = connectDB;
