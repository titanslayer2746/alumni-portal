import mongoose, { Document, Schema } from "mongoose";

// Message type
export type MessageType = "text" | "system";

// Message interface
export interface IMessage extends Document {
  _id: string;
  conversationId: mongoose.Types.ObjectId; // Reference to conversation
  senderId: mongoose.Types.ObjectId; // Reference to user who sent the message
  content: string; // Message content
  type: MessageType; // text or system message
  isRead: boolean; // Whether message has been read
  readAt?: Date; // When message was read
  createdAt: Date;
  updatedAt: Date;
}

// Message schema
const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ isRead: 1 });
MessageSchema.index({ createdAt: -1 });

// Virtual for id (to match frontend interface)
MessageSchema.virtual("id").get(function () {
  return this._id.toString();
});

// Ensure virtual fields are serialized
MessageSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Pre-save middleware to update conversation's lastMessageAt
MessageSchema.post("save", async function (doc) {
  try {
    const Conversation = mongoose.model("Conversation");
    await Conversation.findByIdAndUpdate(
      doc.conversationId,
      { lastMessageAt: doc.createdAt },
      { new: true }
    );
  } catch (error) {
    console.error("Error updating conversation lastMessageAt:", error);
  }
});

// Create and export the model
const Message = mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
