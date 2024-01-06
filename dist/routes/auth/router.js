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
const handler_1 = require("./handler");
const user_controller_1 = __importDefault(require("../../controllers/user.controller"));
const router = express_1.default.Router();
router.post("/register", handler_1.registerValidationHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new user_controller_1.default();
    try {
        const { token, user } = yield controller.createAccount(req);
        res.status(200).send({ token, user });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
router.post("/login", handler_1.loginValidationHandler, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const controller = new user_controller_1.default();
    try {
        const { token, user } = yield controller.login(req);
        res.status(200).send({ token, user });
    }
    catch (error) {
        res.status(400).send({ message: error.message });
    }
}));
exports.default = router;
