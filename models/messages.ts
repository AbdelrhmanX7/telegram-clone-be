import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "conversation" },
  timestamp: { type: Date, default: Date.now },
  senderId: { type: Schema.Types.ObjectId, ref: "users" },
  receiverId: { type: Schema.Types.ObjectId, ref: "users" },
  message: {
    type: String,
    required: [true, `Can't send an empty message`],
  },
  messageState: String,
});

export default mongoose.model("messages", MessageSchema);
