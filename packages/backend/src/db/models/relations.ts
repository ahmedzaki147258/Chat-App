import User from './User';
import Conversation from './Conversation';
import Message from './Message';

// User-Conversation relationships
User.hasMany(Conversation, {
  foreignKey: 'userOneId',
  as: 'startedConversations'
});

User.hasMany(Conversation, {
  foreignKey: 'userTwoId',
  as: 'receivedConversations'
});

Conversation.belongsTo(User, {
  foreignKey: 'userOneId',
  as: 'userOne'
});

Conversation.belongsTo(User, {
  foreignKey: 'userTwoId',
  as: 'userTwo'
});

// Conversation-Message relationships
Conversation.hasMany(Message, {
  foreignKey: 'conversationId',
  as: 'messages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversationId',
  as: 'conversation'
});

// User-Message relationships
User.hasMany(Message, {
  foreignKey: 'senderId',
  as: 'sentMessages'
});

Message.belongsTo(User, {
  foreignKey: 'senderId',
  as: 'sender'
});

export { User, Conversation, Message };