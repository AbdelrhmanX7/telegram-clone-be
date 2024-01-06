"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversationValidationHandler = void 0;
const joi_1 = __importDefault(require("joi"));
const getConversationValidationHandler = (req, res, next) => {
    const schema = joi_1.default.object({
        page: joi_1.default.string().required(),
        userId: joi_1.default.string().required(),
    });
    const validateResult = schema.validate(req.query);
    if (validateResult.error) {
        return res.status(400).send({ message: validateResult.error.message });
    }
    next();
};
exports.getConversationValidationHandler = getConversationValidationHandler;
