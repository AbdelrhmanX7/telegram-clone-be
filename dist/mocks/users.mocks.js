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
exports.createRandomUser = void 0;
const config_1 = require("../config");
const faker_1 = require("@faker-js/faker");
const users_1 = __importDefault(require("../models/users"));
function createRandomUser() {
    return {
        username: faker_1.faker.internet.userName(),
        email: faker_1.faker.internet.email(),
        password: faker_1.faker.internet.password(),
        phoneNumber: faker_1.faker.string.numeric({ length: { min: 11, max: 11 } }),
    };
}
exports.createRandomUser = createRandomUser;
function MockUpUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, config_1.Connect)();
        const USERS = faker_1.faker.helpers.multiple(createRandomUser, {
            count: 100,
        });
        yield users_1.default.insertMany(USERS);
        console.log("Done");
    });
}
MockUpUsers();
