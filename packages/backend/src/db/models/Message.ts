import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from "sequelize";
import { sequelize } from "../../config/database";

export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare messageType: "text" | "image";
  declare conversationId: number;
  declare senderId: number;
  declare readAt: Date | null;
  declare deliveredAt: Date | null;
  declare isEdited: CreationOptional<boolean>;
  declare isDeleted: CreationOptional<boolean>;
  declare editedAt: Date | null;
  declare deletedAt: Date | null;
  declare replyToMessageId: number | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  async markAsRead(): Promise<void> {
    this.readAt = new Date();
    await this.save();
  }

  async markAsDelivered(): Promise<void> {
    this.deliveredAt = new Date();
    await this.save();
  }

  async editMessage(newContent: string): Promise<void> {
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    await this.save();
  }

  async deleteMessage(): Promise<void> {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = "This message was deleted";
    await this.save();
  }

  isRead(): boolean {
    return this.readAt !== null;
  }

  isDelivered(): boolean {
    return this.deliveredAt !== null;
  }

  canBeEdited(): boolean {
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
    const messageAge = Date.now() - this.createdAt.getTime();
    return !this.isDeleted && messageAge <= editTimeLimit;
  }
}

Message.init(
  {
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      autoIncrement: true,
      primaryKey: true
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    messageType: {
      type: DataTypes.ENUM("text", "image"),
      allowNull: false,
      defaultValue: "text"
    },
    conversationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isEdited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    editedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    replyToMessageId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: true,
      references: {
        model: "messages",
        key: "id"
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE"
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
    tableName: "messages",
    timestamps: true,
    indexes: [
      {
        fields: ["conversationId"]
      },
      {
        fields: ["senderId"]
      },
      {
        fields: ["createdAt"]
      },
      {
        fields: ["messageType"]
      },
      {
        fields: ["readAt"]
      },
      {
        fields: ["deliveredAt"]
      },
      {
        fields: ["isEdited"]
      },
      {
        fields: ["isDeleted"]
      },
      {
        fields: ["replyToMessageId"]
      }
    ]
  }
);

export default Message;