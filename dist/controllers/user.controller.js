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
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _UserController_SECRET_KEY;
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const users_1 = __importDefault(require("../models/users"));
class UserController {
    constructor() {
        var _a, _b;
        _UserController_SECRET_KEY.set(this, void 0);
        __classPrivateFieldSet(this, _UserController_SECRET_KEY, (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.SECRET_KEY) !== null && _b !== void 0 ? _b : "DEV", "f");
    }
    dynamicBlurDataUrl(url) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const baseUrl = (_b = (_a = process === null || process === void 0 ? void 0 : process.env) === null || _a === void 0 ? void 0 : _a.BASE_URL) !== null && _b !== void 0 ? _b : "http://localhost:3000/";
            const base64str = yield fetch(`${baseUrl}/_next/image?url=${url}&w=16&q=75`).then((res) => __awaiter(this, void 0, void 0, function* () { return Buffer.from(yield res.arrayBuffer()).toString("base64"); }));
            const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='1' />
      </filter>

      <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
      href='data:image/avif;base64,${base64str}' />
    </svg>
  `;
            const toBase64 = (str) => typeof window === "undefined"
                ? Buffer.from(str).toString("base64")
                : window.btoa(str);
            return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
        });
    }
    createAccount(req) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const { password, username, email, phoneNumber } = req.body;
            const imageUrl = (_a = req.body) === null || _a === void 0 ? void 0 : _a.profileImage;
            const bcryptPassword = yield bcrypt_1.default.hash(password, 8);
            let profileImage = { url: "", blurHash: "" };
            if ((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.profileImage) === null || _c === void 0 ? void 0 : _c.length) {
                const blurHash = yield this.dynamicBlurDataUrl(imageUrl);
                profileImage = { url: imageUrl, blurHash };
            }
            const user = yield users_1.default.create({
                username,
                email,
                password: bcryptPassword,
                phoneNumber,
                profileImage,
            });
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, __classPrivateFieldGet(this, _UserController_SECRET_KEY, "f"), {
                expiresIn: "48H",
            });
            return { token, user };
        });
    }
    login(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const user = yield users_1.default.findOne({ email });
            if (!(user === null || user === void 0 ? void 0 : user._id))
                throw new Error("User not exist");
            if (!bcrypt_1.default.compareSync(password, user.password))
                throw new Error("Wrong password");
            const token = jsonwebtoken_1.default.sign({ userId: user._id }, __classPrivateFieldGet(this, _UserController_SECRET_KEY, "f"), {
                expiresIn: "48H",
            });
            return { token, user };
        });
    }
    getUsers(req) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const { search } = req.query;
            const token = (_b = (_a = req === null || req === void 0 ? void 0 : req.headers) === null || _a === void 0 ? void 0 : _a.authorization) !== null && _b !== void 0 ? _b : "";
            const { userId } = jsonwebtoken_1.default.decode(token);
            if (!(search === null || search === void 0 ? void 0 : search.length))
                return [];
            const pageSize = 10;
            const users = yield users_1.default.aggregate([
                {
                    $match: {
                        $or: [
                            { username: { $regex: search, $options: "i" } },
                            { email: { $regex: search, $options: "i" } },
                            { phoneNumber: { $regex: search, $options: "i" } },
                        ],
                    },
                },
                { $limit: pageSize },
            ]);
            const filteredUsers = users.filter((user) => user._id.toString() !== userId);
            return filteredUsers;
        });
    }
}
_UserController_SECRET_KEY = new WeakMap();
exports.default = UserController;
