"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
class Message extends sequelize_1.Model {
    async markAsRead() {
        this.readAt = new Date();
        await this.save();
    }
    isRead() {
        return this.readAt !== null;
    }
}
exports.Message = Message;
Message.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    messageType: {
        type: sequelize_1.DataTypes.ENUM('text', 'image'),
        allowNull: false,
        defaultValue: 'text'
    },
    conversationId: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'conversations',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    senderId: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
    },
    readAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: database_1.sequelize,
    tableName: 'messages',
    timestamps: true,
    indexes: [
        {
            fields: ['conversationId']
        },
        {
            fields: ['senderId']
        },
        {
            fields: ['createdAt']
        },
        {
            fields: ['messageType']
        },
        {
            fields: ['readAt']
        }
    ]
});
exports.default = Message;
