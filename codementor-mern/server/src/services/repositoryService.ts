import { Repository } from '../models/Repository';
import { Embedding } from '../models/Embedding';
import { getOpenAI } from '../config/openai';
import { getClaude } from '../config/claude';

export class RepositoryService {
  async analyzeRepository(repositoryId:): Promise<void> {
    const repository = await Repository.findById(repositoryId);
    if (!repository) throw new Error('Repository not found');

    // TODO: Implement actual repository analysis logic
    // This would include:
    // 1. Clone/download the repository
    // 2. Parse files using tree-sitter
    // 3. Extract code structure
    // 4. Generate embeddings for semantic search
    // 5. Build knowledge graph

    repository.status = 'ready';
    repository.filesCount = 10;
    repository.nodesCount = 25;
    repository.relationshipsCount = 15;
    repository.lastAnalyzed = new Date();
    await repository.save();
  }

  async generateEmbeddings(repositoryId: string, filePath: string, content: string): Promise<void> {
    const openai = getOpenAI();

    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: content,
    });

    await Embedding.create({
      repositoryId: repositoryId as any,
      filePath,
      content,
      embedding: response.data[0].embedding,
      metadata: {
        language: 'javascript',
        lines: content.split('\n').length,
        functions: [],
        classes: [],
      },
    });
  }

  async explainCode(repositoryId: string, code: string, question: string): Promise<string> {
    const claude = getClaude();

    const message = await claude.messages.create({
      model: 'claude-3-5-sonnet-20250620',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Explain this code:\n\n${code}\n\nQuestion: ${question}`,
        },
      ],
    });

    return message.content[0].text;
  }
}

export default new RepositoryService();
