import OpenAI from 'openai';
import { CodeNode, EmbeddedCodeNode } from './embeddings';
import { LearningStyleDetector } from './learning-style';

export interface CodeSuggestion {
  id: string;
  type: 'improvement' | 'bug_fix' | 'optimization' | 'best_practice' | 'security';
  title: string;
  description: string;
  code: string;
  explanation: string;
  confidence: number;
  line: number;
  file: string;
  alternatives?: string[];
}

export interface SuggestionContext {
  code: string;
  language: string;
  cursorPosition: { line: number; column: number };
  surroundingCode: {
    before: string;
    after: string;
  };
  surrounding: {
    before: string;
    after: string;
  };
}

export class CodeSuggestionEngine {
  private openai: OpenAI;
  private learningStyleDetector: LearningStyleDetector;

  constructor(apiKey: string, learningStyleDetector: LearningStyleDetector) {
    this.openai = new OpenAI({ apiKey });
    this.learningStyleDetector = learningStyleDetector;
  }

  async generateSuggestions(
    context: SuggestionContext,
    similarNodes: EmbeddedCodeNode[]
  ): Promise<CodeSuggestion[]> {
    const suggestions: CodeSuggestion[] = [];

    // Analyze code for potential improvements
    const improvementSuggestions = await this.analyzeForImprovements(context);
    suggestions.push(...improvementSuggestions);

    // Check for common bugs
    const bugSuggestions = await this.analyzeForBugs(context);
    suggestions.push(...bugSuggestions);

    // Suggest optimizations
    const optimizationSuggestions = await this.analyzeForOptimizations(context);
    suggestions.push(...optimizationSuggestions);

    // Suggest best practices
    const practiceSuggestions = await this.analyzeForBestPractices(context, similarNodes);
    suggestions.push(...practiceSuggestions);

    // Check for security issues
    const securitySuggestions = await this.analyzeForSecurity(context);
    suggestions.push(...securitySuggestions);

    // Sort by confidence and return top suggestions
    return suggestions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
  }

  private async analyzeForImprovements(
    context: SuggestionContext
  ): Promise<CodeSuggestion[]> {
    const prompt = `
Analyze this code for potential improvements:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Context before:
${context.surrounding.before}

Context after:
${context.surrounding.after}

Provide 1-2 specific improvement suggestions with:
- Type: improvement
- Title: Brief description
- Description: Why this improvement matters
- Code: The improved code
- Explanation: Detailed explanation
- Confidence: 0-100
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return this.parseSuggestionsFromResponse(
        response.choices[0].message.content || '',
        'improvement',
        context
      );
    } catch (error) {
      console.error('Error analyzing for improvements:', error);
      return [];
    }
  }

  private async analyzeForBugs(context: SuggestionContext): Promise<CodeSuggestion[]> {
    const prompt = `
Analyze this code for potential bugs:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Identify common bugs like:
- Null/undefined errors
- Off-by-one errors
- Race conditions
- Memory leaks
- Type errors

Provide 1-2 bug fix suggestions with:
- Type: bug_fix
- Title: Brief description of the bug
- Description: Why this is a bug
- Code: The fixed code
- Explanation: How the fix works
- Confidence: 0-100
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return this.parseSuggestionsFromResponse(
        response.choices[0].message.content || '',
        'bug_fix',
        context
      );
    } catch (error) {
      console.error('Error analyzing for bugs:', error);
      return [];
    }
  }

  private async analyzeForOptimizations(
    context: SuggestionContext
  ): Promise<CodeSuggestion[]> {
    const prompt = `
Analyze this code for performance optimizations:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Look for:
- Algorithmic improvements
- Redundant computations
- Inefficient data structures
- Caching opportunities
- Lazy evaluation

Provide 1-2 optimization suggestions with:
- Type: optimization
- Title: Brief description
- Description: Performance impact
- Code: The optimized code
- Explanation: Why it's faster
- Confidence: 0-100
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return this.parseSuggestionsFromResponse(
        response.choices[0].message.content || '',
        'optimization',
        context
      );
    } catch (error) {
      console.error('Error analyzing for optimizations:', error);
      return [];
    }
  }

  private async analyzeForBestPractices(
    context: SuggestionContext,
    similarNodes: EmbeddedCodeNode[]
  ): Promise<CodeSuggestion[]> {
    const similarCode = similarNodes
      .slice(0, 3)
      .map(node => node.code)
      .join('\n\n');

    const prompt = `
Analyze this code for best practices:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Similar patterns in codebase:
${similarCode}

Suggest best practices for:
- Code organization
- Naming conventions
- Error handling
- Documentation
- Testing

Provide 1-2 best practice suggestions with:
- Type: best_practice
- Title: Brief description
- Description: Why this is a best practice
- Code: Example implementation
- Explanation: Benefits of following this practice
- Confidence: 0-100
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      return this.parseSuggestionsFromResponse(
        response.choices[0].message.content || '',
        'best_practice',
        context
      );
    } catch (error) {
      console.error('Error analyzing for best practices:', error);
      return [];
    }
  }

  private async analyzeForSecurity(
    context: SuggestionContext
  ): Promise<CodeSuggestion[]> {
    const prompt = `
Analyze this code for security vulnerabilities:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

Check for:
- SQL injection
- XSS vulnerabilities
- CSRF issues
- Authentication flaws
- Authorization bypass
- Sensitive data exposure
- Insecure dependencies

Provide 1-2 security suggestions with:
- Type: security
- Title: Brief description of the vulnerability
- Description: Security impact
- Code: Secure implementation
- Explanation: How the fix addresses the vulnerability
- Confidence: 0-100
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      });

      return this.parseSuggestionsFromResponse(
        response.choices[0].message.content || '',
        'security',
        context
      );
    } catch (error) {
      console.error('Error analyzing for security:', error);
      return [];
    }
  }

  private parseSuggestionsFromResponse(
    response: string,
    type: CodeSuggestion['type'],
    context: SuggestionContext
  ): CodeSuggestion[] {
    // This is a simplified parser - in production, you'd use structured output
    const suggestions: CodeSuggestion[] = [];

    // Try to extract structured data from the response
    const sections = response.split(/\n(?=Title:|Type:)/);

    sections.forEach((section, index) => {
      const titleMatch = section.match(/Title:\s*(.+)/);
      const descriptionMatch = section.match(/Description:\s*(.+)/);
      const codeMatch = section.match(/Code:\s*```[\s\S]*?```([\s\S]*?)(?=Explanation:|$)/);
      const explanationMatch = section.match(/Explanation:\s*(.+)/);
      const confidenceMatch = section.match(/Confidence:\s*(\d+)/);

      if (titleMatch && descriptionMatch) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${index}`,
          type,
          title: titleMatch[1].trim(),
          description: descriptionMatch[1].trim(),
          code: codeMatch ? codeMatch[1].trim() : context.code,
          explanation: explanationMatch ? explanationMatch[1].trim() : '',
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 70,
          line: context.cursorPosition.line,
          file: 'current',
        });
      }
    });

    return suggestions;
  }

  adaptExplanationForLearningStyle(explanation: string): string {
    return this.learningStyleDetector.getAdaptedExplanation(explanation);
  }

  async generateAlternativeApproaches(
    context: SuggestionContext
  ): Promise<string[]> {
    const prompt = `
Provide 2-3 alternative approaches to solve this problem:

Language: ${context.language}
Code:
\`\`\`${context.language}
${context.code}
\`\`\`

For each alternative, provide:
- Brief description
- Code example
- Trade-offs compared to current approach
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      // Parse alternatives from response
      const alternatives: string[] = [];
      const sections = response.choices[0].message.content?.split(/\n(?=Alternative \d:)/) || [];

      sections.forEach(section => {
        const codeMatch = section.match(/```[\s\S]*?```/);
        if (codeMatch) {
          alternatives.push(codeMatch[0]);
        }
      });

      return alternatives;
    } catch (error) {
      console.error('Error generating alternatives:', error);
      return [];
    }
  }
}
