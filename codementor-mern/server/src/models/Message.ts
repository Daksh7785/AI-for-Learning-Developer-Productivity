import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  chatId: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
