import { sequelize } from "../index";
import { DataTypes, Model } from "sequelize";

export class User extends Model {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string | null;
  public loginType!: 'local' | 'google';
  public imageUrl!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
      type: new DataTypes.STRING(255),
      allowNull: true
    }
  },
  {
    sequelize, // passing the `sequelize` instance is required
    tableName: "users",
    timestamps: true
  }
);
