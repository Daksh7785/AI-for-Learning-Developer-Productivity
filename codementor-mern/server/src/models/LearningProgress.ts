import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningProgress extends Document {
  userId: mongoose.Types.ObjectId;
  repositoryId: mongoose.Types.ObjectId;
  module: string;
  completed: boolean;
  score?: number;
  timeSpent: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LearningProgressSchema = new Schema<ILearningProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    module: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const LearningProgress = mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema);
