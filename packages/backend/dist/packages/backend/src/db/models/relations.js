"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = exports.Conversation = exports.User = void 0;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Conversation_1 = __importDefault(require("./Conversation"));
exports.Conversation = Conversation_1.default;
const Message_1 = __importDefault(require("./Message"));
exports.Message = Message_1.default;
// User-Conversation relationships
User_1.default.hasMany(Conversation_1.default, {
    foreignKey: 'userOneId',
    as: 'startedConversations'
});
User_1.default.hasMany(Conversation_1.default, {
    foreignKey: 'userTwoId',
    as: 'receivedConversations'
});
Conversation_1.default.belongsTo(User_1.default, {
    foreignKey: 'userOneId',
    as: 'userOne'
});
Conversation_1.default.belongsTo(User_1.default, {
    foreignKey: 'userTwoId',
    as: 'userTwo'
});
// Conversation-Message relationships
Conversation_1.default.hasMany(Message_1.default, {
    foreignKey: 'conversationId',
    as: 'messages'
});
Message_1.default.belongsTo(Conversation_1.default, {
    foreignKey: 'conversationId',
    as: 'conversation'
});
// User-Message relationships
User_1.default.hasMany(Message_1.default, {
    foreignKey: 'senderId',
    as: 'sentMessages'
});
Message_1.default.belongsTo(User_1.default, {
    foreignKey: 'senderId',
    as: 'sender'
});
