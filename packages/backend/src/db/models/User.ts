import bcrypt from "bcryptjs";
import { sequelize } from "../../config/database";
import { DataTypes, Model, CreationOptional, InferAttributes, InferCreationAttributes } from 'sequelize';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare password: CreationOptional<string | null>;
  declare authProvider: 'local' | 'google';
  declare googleId: CreationOptional<string | null>;
  declare imageUrl: CreationOptional<string | null>;
  declare lastSeen: CreationOptional<Date>;
  declare isOnline: CreationOptional<boolean>;
  declare refreshToken: CreationOptional<string | null>;

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return await bcrypt.compare(password, this.password);
  }

  async updateConnectionStatus(isOnline: boolean): Promise<void> {
    this.isOnline = isOnline;
    if (!isOnline) {
      this.lastSeen = new Date();
    }
    await this.save();
  }

  static async safeCreate(userData: InferCreationAttributes<User>): Promise<User> {
    try {
      return await this.create(userData);
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  toJSON() {
    const { id, name, email, authProvider, imageUrl, lastSeen, isOnline } = this.get();
    return { id, name, email, authProvider, imageUrl, lastSeen, isOnline };
  }
}

User.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
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
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: [0, 255],
        localPasswordRequired(this: User) {
          if (this.authProvider === 'local' && (!this.password || this.password.trim() === '')) {
            throw new Error('Password is required for local users');
          }
        }
      }
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google'),
      allowNull: false,
      defaultValue: 'local'
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        isUrl: { msg: 'Invalid URL format' }
      }
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { 
        exclude: ['password', 'refreshToken', 'createdAt', 'updatedAt'] 
      }
    },
    hooks: {
      beforeValidate: (user: User) => {
        if (user.email) {
          user.email = user.email.toLowerCase().trim();
        }
        if (user.password) {
          user.password = user.password.trim();
        }
      },
      beforeSave: async (user: User) => {
        if (user.changed('authProvider') && user.authProvider === 'local') {
          if (!user.password) {
            throw new Error('Password is required when switching to local login');
          }

          // Hash password if user switches to local
          user.password = await bcrypt.hash(user.password, 12);
        } else if (user.password && user.changed('password') && user.authProvider === 'local') {
          // Hash password if changed and authProvider is local
          user.password = await bcrypt.hash(user.password, 12);
        }
        
        // Remove password if authProvider is google
        if (user.authProvider === 'google' && user.password) {
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
        fields: ['authProvider']
      }
    ]
  }
);

// add scopes
User.addScope('active', { where: { isOnline: true } });
User.addScope('localUsers', { where: { authProvider: 'local' } });
User.addScope('googleUsers', { where: { authProvider: 'google' } });

export default User;