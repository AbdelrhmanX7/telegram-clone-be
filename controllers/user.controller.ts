import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Users from "../models/users";
class UserController {
  #SECRET_KEY;
  constructor() {
    this.#SECRET_KEY = process?.env?.SECRET_KEY ?? "DEV";
  }

  async dynamicBlurDataUrl(url: string) {
    const baseUrl = process?.env?.BASE_URL ?? "http://localhost:3000/";
    const base64str = await fetch(
      `${baseUrl}/_next/image?url=${url}&w=16&q=75`
    ).then(async (res) =>
      Buffer.from(await res.arrayBuffer()).toString("base64")
    );

    const blurSvg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 5'>
      <filter id='b' color-interpolation-filters='sRGB'>
        <feGaussianBlur stdDeviation='1' />
      </filter>

      <image preserveAspectRatio='none' filter='url(#b)' x='0' y='0' height='100%' width='100%' 
      href='data:image/avif;base64,${base64str}' />
    </svg>
  `;

    const toBase64 = (str: string) =>
      typeof window === "undefined"
        ? Buffer.from(str).toString("base64")
        : window.btoa(str);

    return `data:image/svg+xml;base64,${toBase64(blurSvg)}`;
  }

  async createAccount(req: Request) {
    const { password, username, email, phoneNumber } = req.body;
    const imageUrl = req.body?.profileImage;
    const bcryptPassword = await bcrypt.hash(password, 8);

    let profileImage: any = { url: "", blurHash: "" };

    if (req.body?.profileImage?.length) {
      const blurHash = await this.dynamicBlurDataUrl(imageUrl);
      profileImage = { url: imageUrl, blurHash };
    }

    const user: any = await Users.create({
      username,
      email,
      password: bcryptPassword,
      phoneNumber,
      profileImage,
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
    const { search } = req.query;
    if (!search?.length) return [];
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
      { $limit: pageSize },
    ]);

    return users;
  }
}

export default UserController;
