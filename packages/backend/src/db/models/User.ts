import bcrypt from "bcryptjs";
import { sequelize } from "../index";
import { DataTypes, Model, Optional } from 'sequelize';
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string | null;
  loginType: 'local' | 'google';
  imageUrl: string | null;
  lastSeen?: Date;
  isOnline: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'imageUrl' | 'lastSeen' | 'isOnline' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public loginType!: 'local' | 'google';
  public imageUrl!: string | null;
  public lastSeen!: Date;
  public isOnline!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  validPassword(password: string): boolean {
    if (!this.password) return false;
    return bcrypt.compareSync(password, this.password);
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
      type: new DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: new DataTypes.STRING(255),
      unique: true,   
      allowNull: false
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: true
    },
    loginType: {
      type: new DataTypes.ENUM('local', 'google'),
      allowNull: false,
      defaultValue: 'local'
    },
    imageUrl: {
      type: new DataTypes.STRING(500),
      allowNull: true
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
    }
  },
  {
    sequelize,
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeCreate: (user) => {
        if (user.password) {
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        }
      },
      beforeUpdate: (user) => {
        if (user.password && user.changed('password')) {
          user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
        }
      }
    }
  }
);
