import mongoose, { Schema } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const UserSchema = new Schema({
  profileImage: { url: String, blurHash: String },
  username: { type: String, require: [true, "you must add a username"] },
  phoneNumber: {
    type: String,
    require: [true, "you must add a phone number"],
    unique: true,
  },
  email: {
    type: String,
    require: [true, "you must add an email"],
    unique: true,
  },
  password: {
    type: String,
    require: [true, "you must add a password"],
  },
});

export default mongoose.model(
  "users",
  UserSchema.plugin(uniqueValidator, {
    message: "Error, expected {PATH} to be unique.",
  })
);
