import mongoose, { Document, Schema } from 'mongoose';

export interface IRepository extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  description?: string;
  language: string;
  status: 'analyzing' | 'ready' | 'error';
  lastAnalyzed?: Date;
  filesCount: number;
  nodesCount: number;
  relationshipsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    language: {
      type: String,
      default: 'unknown',
    },
    status: {
      type: String,
      enum: ['analyzing', 'ready', 'error'],
      default: 'analyzing',
    },
    lastAnalyzed: {
      type: Date,
    },
    filesCount: {
      type: Number,
      default: 0,
    },
    nodesCount: {
      type: Number,
      default: 0,
    },
    relationshipsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Repository = mongoose.model<IRepository>('Repository', RepositorySchema);
