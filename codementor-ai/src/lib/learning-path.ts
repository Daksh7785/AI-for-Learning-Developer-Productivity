import { CodeNode, ParsedCodebase } from './ast-parser';

export interface LearningModule {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  prerequisites: string[];
  relatedCode: CodeNode[];
  completed: boolean;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  modules: LearningModule[];
  totalEstimatedTime: number;
  progress: number; // 0-100
}

export class AdaptiveLearningPathGenerator {
  private userKnowledge: Set<string> = new Set();
  private learningHistory: Map<string, { timestamp: Date; score: number }> = new Map();

  generatePathFromCodebase(
    codebase: ParsedCodebase,
    userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): LearningPath {
    const modules = this.createModulesFromCodebase(codebase, userLevel);
    const orderedModules = this.orderModulesByDependencies(modules);
    
    return {
      id: `path-${Date.now()}`,
      name: `${this.capitalizeFirst(userLevel)} Developer Learning Path`,
      description: `Personalized learning path based on your codebase analysis`,
      modules: orderedModules,
      totalEstimatedTime: orderedModules.reduce((sum, m) => sum + m.estimatedTime, 0),
      progress: this.calculateProgress(orderedModules),
    };
  }

  private createModulesFromCodebase(
    codebase: ParsedCodebase,
    userLevel: string
  ): LearningModule[] {
    const modules: LearningModule[] = [];
    const conceptGroups = this.groupNodesByConcept(codebase.nodes);

    conceptGroups.forEach((nodes, concept) => {
      const difficulty = this.assessDifficulty(nodes, userLevel);
      const prerequisites = this.findPrerequisites(nodes, codebase.relationships);

      modules.push({
        id: `module-${concept}`,
        title: this.generateModuleTitle(concept, nodes),
        description: this.generateModuleDescription(concept, nodes),
        concepts: [concept, ...this.extractRelatedConcepts(nodes)],
        difficulty,
        estimatedTime: this.estimateTime(nodes, difficulty),
        prerequisites,
        relatedCode: nodes,
        completed: this.isModuleCompleted(concept),
      });
    });

    return modules;
  }

  private groupNodesByConcept(nodes: CodeNode[]): Map<string, CodeNode[]> {
    const groups = new Map<string, CodeNode[]>();

    nodes.forEach(node => {
      const concept = this.extractConcept(node);
      if (!groups.has(concept)) {
        groups.set(concept, []);
      }
      groups.get(concept)!.push(node);
    });

    return groups;
  }

  private extractConcept(node: CodeNode): string {
    // Extract concept from node name and type
    const baseName = node.name.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    return `${node.type}-${baseName}`;
  }

  private assessDifficulty(nodes: CodeNode[], userLevel: string): LearningModule['difficulty'] {
    const complexityScore = nodes.reduce((score, node) => {
      let nodeScore = 0;
      
      // Count dependencies
      nodeScore += node.dependencies.length * 2;
      
      // Count exports (more exports = more complex)
      nodeScore += node.exports.length;
      
      // Code length
      nodeScore += node.code.length / 100;

      return score + nodeScore;
    }, 0);

    const avgComplexity = complexityScore / nodes.length;

    if (userLevel === 'beginner') {
      return avgComplexity < 5 ? 'beginner' : avgComplexity < 15 ? 'intermediate' : 'advanced';
    } else if (userLevel === 'intermediate') {
      return avgComplexity < 10 ? 'beginner' : avgComplexity < 25 ? 'intermediate' : 'advanced';
    } else {
      return avgComplexity < 20 ? 'beginner' : avgComplexity < 40 ? 'intermediate' : 'advanced';
    }
  }

  private findPrerequisites(
    nodes: CodeNode[],
    relationships: any[]
  ): string[] {
    const prerequisites = new Set<string>();

    nodes.forEach(node => {
      relationships
        .filter(rel => rel.from === node.id && rel.type === 'import')
        .forEach(rel => {
          prerequisites.add(rel.to);
        });
    });

    return Array.from(prerequisites);
  }

  private generateModuleTitle(concept: string, nodes: CodeNode[]): string {
    const primaryType = nodes[0].type;
    const name = concept.split('-')[1] || concept;
    
    const titles: Record<string, string> = {
      'function': `Understanding ${name} Functions`,
      'class': `Mastering ${name} Classes`,
      'variable': `Working with ${name} Variables`,
      'interface': `Implementing ${name} Interfaces`,
      'type': `Using ${name} Types`,
    };

    return titles[primaryType] || `Learning ${concept}`;
  }

  private generateModuleDescription(concept: string, nodes: CodeNode[]): string {
    const nodeCount = nodes.length;
    const files = new Set(nodes.map(n => n.file)).size;
    
    return `Explore ${nodeCount} ${nodes[0].type}${nodeCount > 1 ? 's' : ''} across ${files} file${files > 1 ? 's' : ''}. Learn how ${concept} is used in this codebase and understand its role in the overall architecture.`;
  }

  private extractRelatedConcepts(nodes: CodeNode[]): string[] {
    const concepts = new Set<string>();

    nodes.forEach(node => {
      node.dependencies.forEach(dep => {
        concepts.add(dep);
      });
      node.imports.forEach(imp => {
        concepts.add(imp);
      });
    });

    return Array.from(concepts).slice(0, 5);
  }

  private estimateTime(nodes: CodeNode[], difficulty: string): number {
    const baseTime = nodes.length * 5; // 5 minutes per node
    const multiplier = {
      beginner: 1,
      intermediate: 1.5,
      advanced: 2,
    };

    return Math.round(baseTime * multiplier[difficulty as keyof typeof multiplier]);
  }

  private isModuleCompleted(concept: string): boolean {
    return this.userKnowledge.has(concept);
  }

  private orderModulesByDependencies(modules: LearningModule[]): LearningModule[] {
    const ordered: LearningModule[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    const visit = (module: LearningModule) => {
      if (visited.has(module.id)) return;
      if (visiting.has(module.id)) return; // Cycle detected, skip

      visiting.add(module.id);

      // Visit prerequisites first
      module.prerequisites.forEach(prereq => {
        const prereqModule = modules.find(m => m.id.includes(prereq));
        if (prereqModule && !visited.has(prereqModule.id)) {
          visit(prereqModule);
        }
      });

      visiting.delete(module.id);
      visited.add(module.id);
      ordered.push(module);
    };

    modules.forEach(module => visit(module));

    return ordered;
  }

  private calculateProgress(modules: LearningModule[]): number {
    if (modules.length === 0) return 0;
    const completed = modules.filter(m => m.completed).length;
    return Math.round((completed / modules.length) * 100);
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  markModuleCompleted(moduleId: string) {
    const module = this.userKnowledge.has(moduleId);
    if (!module) {
      this.userKnowledge.add(moduleId);
      this.learningHistory.set(moduleId, {
        timestamp: new Date(),
        score: 100,
      });
    }
  }

  recordLearningAttempt(concept: string, score: number) {
    this.learningHistory.set(concept, {
      timestamp: new Date(),
      score,
    });

    if (score >= 80) {
      this.userKnowledge.add(concept);
    }
  }

  getKnowledgeGaps(codebase: ParsedCodebase): string[] {
    const allConcepts = new Set<string>();
    codebase.nodes.forEach(node => {
      allConcepts.add(this.extractConcept(node));
    });

    return Array.from(allConcepts).filter(concept => !this.userKnowledge.has(concept));
  }

  getNextRecommendedModule(codebase: ParsedCodebase): LearningModule | null {
    const path = this.generatePathFromCodebase(codebase);
    return path.modules.find(m => !m.completed) || null;
  }

  adaptPathBasedOnPerformance(
    currentPath: LearningPath,
    performanceScore: number
  ): LearningPath {
    if (performanceScore < 60) {
      // User is struggling, simplify the path
      return {
        ...currentPath,
        modules: currentPath.modules.map(m => ({
          ...m,
          difficulty: m.difficulty === 'advanced' ? 'intermediate' : 
                     m.difficulty === 'intermediate' ? 'beginner' : m.difficulty,
          estimatedTime: Math.round(m.estimatedTime * 1.5),
        })),
      };
    } else if (performanceScore > 90) {
      // User is excelling, accelerate the path
      return {
        ...currentPath,
        modules: currentPath.modules.map(m => ({
          ...m,
          estimatedTime: Math.round(m.estimatedTime * 0.7),
        })),
      };
    }

    return currentPath;
  }
}
