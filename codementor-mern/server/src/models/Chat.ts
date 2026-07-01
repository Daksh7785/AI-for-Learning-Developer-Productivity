import mongoose, { Document, Schema } from 'mongoose';

export interface IChat extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId?: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
