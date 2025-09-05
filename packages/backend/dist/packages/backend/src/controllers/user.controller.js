"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserImage = exports.getConversationsWithLastMessage = exports.getUsers = void 0;
const sequelize_1 = require("sequelize");
const http_status_1 = __importDefault(require("http-status"));
const db_1 = require("src/db");
const getUsers = async (req, res) => {
    return res.json({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
        // user: req.user,
    });
    // const filters = {};
    // const page = +req.query.page! || 1;
    // const limit = +req.query.limit! || 10;
    // try {
    //   const users = await User.findAll();
    //   res.status(httpStatus.OK).json(users);
    // } catch (error: unknown) {
    //   if (error instanceof Error) {
    //     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
    //   } else {
    //     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
    //   }
    // }
};
exports.getUsers = getUsers;
const getConversationsWithLastMessage = async (req, res) => {
    const userId = 1; //req.user?.id!;
    try {
        const conversations = await db_1.Conversation.findAll({
            where: {
                [sequelize_1.Op.or]: [
                    { userOneId: userId },
                    { userTwoId: userId }
                ]
            },
            include: [
                {
                    model: db_1.User,
                    as: 'userOne',
                },
                {
                    model: db_1.User,
                    as: 'userTwo',
                },
                {
                    model: db_1.Message,
                    as: 'messages',
                    limit: 1,
                    order: [['createdAt', 'DESC']],
                    separate: true,
                    include: [{
                            model: db_1.User,
                            as: 'sender',
                            attributes: ['id', 'name']
                        }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        return res.status(http_status_1.default.OK).json(conversations);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
        }
    }
};
exports.getConversationsWithLastMessage = getConversationsWithLastMessage;
const updateUserImage = async (req, res) => {
    const id = 1; //req.user?.id!;
    try {
        await db_1.User.update({ imageUrl: req.file?.path }, { where: { id } });
        const updatedUser = await db_1.User.findByPk(id);
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ status: "success", data: updatedUser });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: error.message });
        }
        else {
            res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({ message: "Server Error", error: String(error) });
        }
    }
};
exports.updateUserImage = updateUserImage;
