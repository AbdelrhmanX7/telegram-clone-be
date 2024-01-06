"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractUserIdFromToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const extractUserIdFromToken = (req, res, next) => {
    var _a, _b;
    try {
        const token = (_a = req.headers.authorization) !== null && _a !== void 0 ? _a : "";
        if (!(token === null || token === void 0 ? void 0 : token.length))
            throw new Error("Authorization token missing");
        const decodedToken = jsonwebtoken_1.default.decode(token);
        if (!decodedToken || !(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken.userId)) {
            throw new Error("Invalid token or missing user ID");
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch (error) {
        res.status(401).send({ message: (_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : "Unauthorized" });
    }
};
exports.extractUserIdFromToken = extractUserIdFromToken;
