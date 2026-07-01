import { CodeNode, CodeRelationship, ParsedCodebase } from './ast-parser';

export interface GraphNode {
  id: string;
  label: string;
  type: string;
  file: string;
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  properties: Record<string, any>;
}

export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class KnowledgeGraphBuilder {
  private graph: KnowledgeGraph = {
    nodes: [],
    edges: [],
  };

  buildFromCodebase(codebase: ParsedCodebase): KnowledgeGraph {
    this.graph = {
      nodes: [],
      edges: [],
    };

    // Build nodes
    codebase.nodes.forEach(node => {
      this.graph.nodes.push({
        id: node.id,
        label: node.name,
        type: node.type,
        file: node.file,
        properties: {
          line: node.line,
          dependencies: node.dependencies,
          exports: node.exports,
          imports: node.imports,
        },
      });
    });

    // Build edges
    codebase.relationships.forEach((rel, index) => {
      this.graph.edges.push({
        id: `edge-${index}`,
        source: rel.from,
        target: rel.to,
        type: rel.type,
        properties: {
          file: rel.file,
        },
      });
    });

    return this.graph;
  }

  findConnectedNodes(nodeId: string, depth: number = 1): Set<string> {
    const visited = new Set<string>();
    const queue = [nodeId];
    let currentDepth = 0;

    while (queue.length > 0 && currentDepth < depth) {
      const levelSize = queue.length;
      
      for (let i = 0; i < levelSize; i++) {
        const currentId = queue.shift()!;
        visited.add(currentId);

        // Find all connected nodes
        const connected = this.graph.edges
          .filter(edge => edge.source === currentId || edge.target === currentId)
          .map(edge => edge.source === currentId ? edge.target : edge.source);

        connected.forEach(id => {
          if (!visited.has(id)) {
            queue.push(id);
          }
        });
      }

      currentDepth++;
    }

    return visited;
  }

  findShortestPath(fromId: string, toId: string): string[] | null {
    if (fromId === toId) return [fromId];

    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [{ nodeId: fromId, path: [fromId] }];
    visited.add(fromId);

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      const neighbors = this.graph.edges
        .filter(edge => edge.source === nodeId || edge.target === nodeId)
        .map(edge => edge.source === nodeId ? edge.target : edge.source);

      for (const neighbor of neighbors) {
        if (neighbor === toId) {
          return [...path, toId];
        }

        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ nodeId: neighbor, path: [...path, neighbor] });
        }
      }
    }

    return null;
  }

  findNodesByType(type: string): GraphNode[] {
    return this.graph.nodes.filter(node => node.type === type);
  }

  findNodesByFile(file: string): GraphNode[] {
    return this.graph.nodes.filter(node => node.file === file);
  }

  findCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (nodeId: string, path: string[]) => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = this.graph.edges
        .filter(edge => edge.source === nodeId)
        .map(edge => edge.target);

      for (const neighbor of neighbors) {
        if (recursionStack.has(neighbor)) {
          // Found a cycle
          const cycleStart = path.indexOf(neighbor);
          cycles.push([...path.slice(cycleStart), neighbor]);
        } else if (!visited.has(neighbor)) {
          dfs(neighbor, [...path, nodeId]);
        }
      }

      recursionStack.delete(nodeId);
    };

    for (const node of this.graph.nodes) {
      if (!visited.has(node.id)) {
        dfs(node.id, []);
      }
    }

    return cycles;
  }

  getGraphMetrics() {
    return {
      totalNodes: this.graph.nodes.length,
      totalEdges: this.graph.edges.length,
      nodeTypes: this.getNodeTypeDistribution(),
      edgeTypes: this.getEdgeTypeDistribution(),
      averageConnections: this.getAverageConnections(),
      cycles: this.findCycles().length,
    };
  }

  private getNodeTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.graph.nodes.forEach(node => {
      distribution[node.type] = (distribution[node.type] || 0) + 1;
    });

    return distribution;
  }

  private getEdgeTypeDistribution(): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    this.graph.edges.forEach(edge => {
      distribution[edge.type] = (distribution[edge.type] || 0) + 1;
    });

    return distribution;
  }

  private getAverageConnections(): number {
    if (this.graph.nodes.length === 0) return 0;

    const totalConnections = this.graph.nodes.reduce((sum, node) => {
      const connections = this.graph.edges.filter(
        edge => edge.source === node.id || edge.target === node.id
      ).length;
      return sum + connections;
    }, 0);

    return totalConnections / this.graph.nodes.length;
  }

  exportToJSON(): string {
    return JSON.stringify(this.graph, null, 2);
  }

  getGraph(): KnowledgeGraph {
    return this.graph;
  }
}
