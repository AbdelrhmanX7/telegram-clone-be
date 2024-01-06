"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidationHandler = exports.registerValidationHandler = void 0;
const joi_1 = __importDefault(require("joi"));
const registerValidationHandler = (req, res, next) => {
    const schema = joi_1.default.object({
        username: joi_1.default.string().min(3).max(30).required(),
        password: joi_1.default.string().min(6).max(30).required(),
        email: joi_1.default.string().email().required(),
        phoneNumber: joi_1.default.string().min(11).max(11).required(),
        profileImage: joi_1.default.string().empty().allow("").optional(),
    });
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
        const error = validationResult.error.message;
        return res.status(400).send({ message: error });
    }
    next();
};
exports.registerValidationHandler = registerValidationHandler;
const loginValidationHandler = (req, res, next) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required(),
        password: joi_1.default.string().min(6).max(30).required(),
    });
    const validationResult = schema.validate(req.body);
    if (validationResult.error) {
        const error = validationResult.error.message;
        return res.status(400).send({ message: error });
    }
    next();
};
exports.loginValidationHandler = loginValidationHandler;
