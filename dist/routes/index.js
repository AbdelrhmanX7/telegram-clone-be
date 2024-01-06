"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router_1 = __importDefault(require("./auth/router"));
const router_2 = __importDefault(require("./conversation/router"));
const middlewares_1 = require("../middlewares");
const router = express_1.default.Router();
router.use(router_1.default);
router.use("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const token = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) !== null && _b !== void 0 ? _b : "";
    const SECRET_KEY = (_d = (_c = process === null || process === void 0 ? void 0 : process.env) === null || _c === void 0 ? void 0 : _c.SECRET_KEY) !== null && _d !== void 0 ? _d : "";
    if (token) {
        jsonwebtoken_1.default.verify(token, SECRET_KEY, (err) => {
            if (err)
                res.status(401).send({ message: "Unauthorized" });
            next();
        });
    }
    else {
        res.status(401).send({ message: "Unauthorized" });
    }
}));
router.use(middlewares_1.extractUserIdFromToken);
router.use(router_2.default);
exports.default = router;
