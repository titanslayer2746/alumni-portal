import mongoose, { Document, Schema } from "mongoose";

// Conversation status type
export type ConversationStatus = "active" | "closed";

// Conversation interface
export interface IConversation extends Document {
  _id: string;
  participants: mongoose.Types.ObjectId[]; // Array of user IDs
  initiatedBy: mongoose.Types.ObjectId; // User who started the conversation
  jobId?: mongoose.Types.ObjectId; // Optional - link to job if conversation started from shortlisting
  applicationId?: mongoose.Types.ObjectId; // Optional - link to specific application
  status: ConversationStatus;
  lastMessageAt?: Date; // Timestamp of last message for sorting
  createdAt: Date;
  updatedAt: Date;
}

// Conversation schema
const ConversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ initiatedBy: 1 });
ConversationSchema.index({ jobId: 1 });
ConversationSchema.index({ status: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ createdAt: -1 });

// Virtual for id (to match frontend interface)
ConversationSchema.virtual("id").get(function () {
  return this._id.toString();
});

// Ensure virtual fields are serialized
ConversationSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

// Pre-save middleware to validate participants
ConversationSchema.pre("save", async function (next) {
  if (this.isModified("participants")) {
    // Ensure at least 2 participants
    if (this.participants.length < 2) {
      return next(new Error("Conversation must have at least 2 participants"));
    }

    // Ensure no duplicate participants
    const uniqueParticipants = [
      ...new Set(this.participants.map((p) => p.toString())),
    ];
    if (uniqueParticipants.length !== this.participants.length) {
      return next(new Error("Conversation cannot have duplicate participants"));
    }
  }
  next();
});

// Create and export the model
const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);

export default Conversation;
