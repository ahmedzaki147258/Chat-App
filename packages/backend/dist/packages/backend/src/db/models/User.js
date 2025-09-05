"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../../config/database");
const sequelize_1 = require("sequelize");
class User extends sequelize_1.Model {
    async validatePassword(password) {
        if (!this.password)
            return false;
        return await bcryptjs_1.default.compare(password, this.password);
    }
    async updateConnectionStatus(isOnline) {
        this.isOnline = isOnline;
        if (!isOnline) {
            this.lastSeen = new Date();
        }
        await this.save();
    }
    static async safeCreate(userData) {
        try {
            return await this.create(userData);
        }
        catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }
    toJSON() {
        const { id, name, email, loginType, imageUrl, lastSeen, isOnline } = this.get();
        return { id, name, email, loginType, imageUrl, lastSeen, isOnline };
    }
}
exports.User = User;
User.init({
    id: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'Name is required' },
            len: {
                args: [2, 255],
                msg: 'Name must be between 2 and 255 characters'
            }
        }
    },
    email: {
        type: sequelize_1.DataTypes.STRING(255),
        unique: {
            name: 'users_email_unique',
            msg: 'Email already exists'
        },
        allowNull: false,
        validate: {
            isEmail: { msg: 'Invalid email format' },
            notEmpty: { msg: 'Email is required' }
        }
    },
    password: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        validate: {
            len: [0, 255],
            localPasswordRequired() {
                if (this.loginType === 'local' && (!this.password || this.password.trim() === '')) {
                    throw new Error('Password is required for local users');
                }
            }
        }
    },
    loginType: {
        type: sequelize_1.DataTypes.ENUM('local', 'google'),
        allowNull: false,
        defaultValue: 'local'
    },
    imageUrl: {
        type: sequelize_1.DataTypes.STRING(500),
        allowNull: true,
        validate: {
            isUrl: { msg: 'Invalid URL format' }
        }
    },
    lastSeen: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    isOnline: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    refreshToken: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }
}, {
    sequelize: database_1.sequelize,
    tableName: "users",
    timestamps: true,
    defaultScope: {
        attributes: {
            exclude: ['password', 'refreshToken', 'createdAt', 'updatedAt']
        }
    },
    hooks: {
        beforeValidate: (user) => {
            if (user.email) {
                user.email = user.email.toLowerCase().trim();
            }
            if (user.password) {
                user.password = user.password.trim();
            }
        },
        beforeSave: async (user) => {
            if (user.changed('loginType') && user.loginType === 'local') {
                if (!user.password) {
                    throw new Error('Password is required when switching to local login');
                }
                // Hash password if user switches to local
                user.password = await bcryptjs_1.default.hash(user.password, 12);
            }
            else if (user.password && user.changed('password') && user.loginType === 'local') {
                // Hash password if changed and loginType is local
                user.password = await bcryptjs_1.default.hash(user.password, 12);
            }
            // Remove password if loginType is google
            if (user.loginType === 'google' && user.password) {
                user.password = null;
            }
        }
    },
    indexes: [
        {
            unique: true,
            fields: ['email']
        },
        {
            fields: ['isOnline']
        },
        {
            fields: ['loginType']
        }
    ]
});
// add scopes
User.addScope('active', { where: { isOnline: true } });
User.addScope('localUsers', { where: { loginType: 'local' } });
User.addScope('googleUsers', { where: { loginType: 'google' } });
exports.default = User;
