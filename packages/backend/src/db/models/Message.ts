import { DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { sequelize } from '../../config/database';

export class Message extends Model<InferAttributes<Message>, InferCreationAttributes<Message>> {
  declare id: CreationOptional<number>;
  declare content: string;
  declare messageType: 'text' | 'image';
  declare conversationId: number;
  declare senderId: number;
  declare readAt: Date | null;

  async markAsRead(): Promise<void> {
    this.readAt = new Date();
    await this.save();
  }

  isRead(): boolean {
    return this.readAt !== null;
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
      type: DataTypes.ENUM('text', 'image'),
      allowNull: false,
      defaultValue: 'text'
    },
    conversationId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'conversations',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    senderId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
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
  }
);

export default Message;