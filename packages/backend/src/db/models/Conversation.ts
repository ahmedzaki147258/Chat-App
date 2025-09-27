import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../../config/database";

export class Conversation extends Model<InferAttributes<Conversation>, InferCreationAttributes<Conversation>> {
  declare id: CreationOptional<number>;
  declare userOneId: number;
  declare userTwoId: number;
  declare lastMessageAt: CreationOptional<Date>;
  declare userOneUnreadCount: CreationOptional<number>;
  declare userTwoUnreadCount: CreationOptional<number>;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
  declare unreadCount: CreationOptional<number>;

  // Helper methods
  getUnreadCountForUser(userId: number): number {
    if (userId === this.userOneId) return this.userOneUnreadCount;
    if (userId === this.userTwoId) return this.userTwoUnreadCount;
    if (userId === this.userOneId && userId === this.userTwoId) return this.unreadCount;
    return 0;
  }

  async incrementUnreadCount(userId: number): Promise<void> {
    if (userId === this.userOneId) {
      this.userOneUnreadCount += 1;
    } else if (userId === this.userTwoId) {
      this.userTwoUnreadCount += 1;
      this.unreadCount += 1;
    } else if (userId === this.userOneId && userId === this.userTwoId) {
      this.unreadCount += 1;
    }
    await this.save();
  }

  async resetUnreadCount(userId: number): Promise<void> {
    if (userId === this.userOneId) {
      this.userOneUnreadCount = 0;
    } else if (userId === this.userTwoId) {
      this.userTwoUnreadCount = 0;
      this.unreadCount = 0;
    } else if (userId === this.userOneId && userId === this.userTwoId) {
      this.unreadCount = 0;
    }
    await this.save();
  }

  async updateLastMessageTime(): Promise<void> {
    this.lastMessageAt = new Date();
    await this.save();
  }
}

Conversation.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    userOneId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    userTwoId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    userOneUnreadCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    userTwoUnreadCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    unreadCount: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: "conversations",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userOneId", "userTwoId"]
      },
      {
        fields: ["userOneId"]
      },
      {
        fields: ["userTwoId"]
      },
      {
        fields: ["lastMessageAt"]
      },
      {
        fields: ["userOneUnreadCount"]
      },
      {
        fields: ["userTwoUnreadCount"]
      },
      {
        fields: ["unreadCount"]
      }
    ]
  }
);

export default Conversation;