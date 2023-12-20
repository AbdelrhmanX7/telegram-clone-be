import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  userId: { type: Schema.Types.ObjectId, ref: "user" },
  userIds: { type: [Schema.Types.ObjectId], ref: "user" },
  timestamp: { type: Date, default: Date.now },
  isSentByYou: { type: Boolean, default: false },
  senderId: { type: Schema.Types.ObjectId, ref: "" },
  receiverId: { type: Schema.Types.ObjectId, ref: "" },
  message: {
    type: String,
    required: [true, `Can't send an empty message`],
  },
});

export default mongoose.model("messages", MessageSchema);
