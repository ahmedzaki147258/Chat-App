import { User } from "./User";
import { Message } from "./Message";
import { Conversation } from "./Conversation";

// User - Message relationships
User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages"
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender"
});

// Conversation - Message relationships
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages"
});

Message.belongsTo(Conversation, {
  foreignKey: "conversationId",
  as: "conversation"
});

// User - Conversation relationships
User.hasMany(Conversation, {
  foreignKey: "userOneId",
  as: "conversationsAsUserOne"
});

User.hasMany(Conversation, {
  foreignKey: "userTwoId", 
  as: "conversationsAsUserTwo"
});

Conversation.belongsTo(User, {
  foreignKey: "userOneId",
  as: "userOne"
});

Conversation.belongsTo(User, {
  foreignKey: "userTwoId",
  as: "userTwo"
});

// Message - Message relationships (for replies)
Message.hasMany(Message, {
  foreignKey: "replyToMessageId",
  as: "replies"
});

Message.belongsTo(Message, {
  foreignKey: "replyToMessageId",
  as: "replyToMessage"
});

export { User, Message, Conversation };