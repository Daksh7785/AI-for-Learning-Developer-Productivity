import OpenAI from 'openai';
import { CodeNode, CodeRelationship } from './ast-parser';

export type { CodeNode, CodeRelationship } from './ast-parser';

export interface EmbeddedCodeNode extends CodeNode {
  embedding: number[];
}

export interface SimilarityResult {
  node: EmbeddedCodeNode;
  similarity: number;
}

export class EmbeddingSystem {
  private openai: OpenAI;
  private embeddedNodes: Map<string, EmbeddedCodeNode> = new Map();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async embedCodeNode(node: CodeNode): Promise<EmbeddedCodeNode> {
    const text = this.createEmbeddingText(node);
    
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    const embeddedNode: EmbeddedCodeNode = {
      ...node,
      embedding: response.data[0].embedding,
    };

    this.embeddedNodes.set(node.id, embeddedNode);
    return embeddedNode;
  }

  async embedCodebase(nodes: CodeNode[]): Promise<EmbeddedCodeNode[]> {
    const embeddedNodes: EmbeddedCodeNode[] = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < nodes.length; i += batchSize) {
      const batch = nodes.slice(i, i + batchSize);
      const batchEmbedded = await Promise.all(
        batch.map(node => this.embedCodeNode(node))
      );
      embeddedNodes.push(...batchEmbedded);
    }

    return embeddedNodes;
  }

  private createEmbeddingText(node: CodeNode): string {
    return `
Type: ${node.type}
Name: ${node.name}
File: ${node.file}
Code: ${node.code}
Dependencies: ${node.dependencies.join(', ')}
Exports: ${node.exports.join(', ')}
Imports: ${node.imports.join(', ')}
    `.trim();
  }

  async findSimilarNodes(
    query: string,
    topK: number = 5
  ): Promise<SimilarityResult[]> {
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    const queryVector = queryEmbedding.data[0].embedding;

    const similarities = Array.from(this.embeddedNodes.values()).map(node => ({
      node,
      similarity: this.cosineSimilarity(queryVector, node.embedding),
    }));

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  getEmbeddedNodes(): EmbeddedCodeNode[] {
    return Array.from(this.embeddedNodes.values());
  }

  clear() {
    this.embeddedNodes.clear();
  }
}
