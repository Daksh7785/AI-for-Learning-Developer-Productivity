import mongoose, { Document, Schema } from 'mongoose';

export interface IEmbedding extends Document {
  repositoryId: mongoose.Types.ObjectId;
  filePath: string;
  content: string;
  embedding: number[];
  metadata: {
    language: string;
    lines: number;
    functions: string[];
    classes: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmbeddingSchema = new Schema<IEmbedding>(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Repository',
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      language: String,
      lines: Number,
      functions: [String],
      classes: [String],
    },
  },
  {
    timestamps: true,
  }
);

export const Embedding = mongoose.model<IEmbedding>('Embedding', EmbeddingSchema);
