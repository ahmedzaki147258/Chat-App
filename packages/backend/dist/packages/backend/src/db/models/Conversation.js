"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Conversation = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Conversation extends sequelize_1.Model {
}
exports.Conversation = Conversation;
Conversation.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    userOneId: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    userTwoId: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'conversations',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userOneId', 'userTwoId']
        },
        {
            fields: ['userOneId']
        },
        {
            fields: ['userTwoId']
        }
    ]
});
exports.default = Conversation;
