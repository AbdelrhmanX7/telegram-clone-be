import mongoose, { Schema } from "mongoose";

const ConversationSchema = new Schema({
  userIds: { type: [Schema.Types.ObjectId], ref: "users", unique: true },
});

export default mongoose.model("conversations", ConversationSchema);
