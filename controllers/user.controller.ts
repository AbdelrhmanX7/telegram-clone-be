import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/users";
class UserController {
  #SECRET_KEY;
  constructor() {
    this.#SECRET_KEY = process?.env?.SECRET_KEY ?? "DEV";
  }

  async createAccount(req: Request) {
    const { password, username, email, phoneNumber } = req.body;
    const bcryptPassword = await bcrypt.hash(password, 8);

    const user: any = await Users.create({
      username,
      email,
      password: bcryptPassword,
      phoneNumber,
      profileImage: req.body?.profileImage,
    });

    const token = jwt.sign({ userId: user._id }, this.#SECRET_KEY, {
      expiresIn: "48H",
    });

    return { token, user };
  }

  async login(req: Request) {
    const { email, password } = req.body;
    const user: any = await Users.findOne({ email });
    if (!user?._id) throw new Error("User not exist");
    if (!bcrypt.compareSync(password, user.password))
      throw new Error("Wrong password");

    const token = jwt.sign({ userId: user._id }, this.#SECRET_KEY, {
      expiresIn: "48H",
    });

    return { token, user };
  }

  async getUsers(req: Request) {
    const { page, search } = req.query;
    const pageSize = 10;
    const users = await Users.aggregate([
      {
        $match: {
          $or: [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phoneNumber: { $regex: search, $options: "i" } },
          ],
        },
      },
      { $skip: (Number(page) - 1) * pageSize },
      { $limit: pageSize },
    ]);

    return users;
  }
}

export default UserController;
