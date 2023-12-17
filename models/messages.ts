import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  isSentByYou: { type: Boolean, default: false },
  message: {
    type: String,
    required: [true, `Can't send an empty message`],
  },
});

export default mongoose.model("messages", MessageSchema);
