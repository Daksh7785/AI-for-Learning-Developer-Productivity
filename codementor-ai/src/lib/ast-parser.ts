import * as babel from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

export interface CodeNode {
  id: string;
  type: string;
  name: string;
  file: string;
  line: number;
  column: number;
  dependencies: string[];
  exports: string[];
  imports: string[];
  code: string;
}

export interface CodeRelationship {
  from: string;
  to: string;
  type: 'import' | 'call' | 'extends' | 'implements' | 'reference';
  file: string;
}

export interface ParsedCodebase {
  nodes: CodeNode[];
  relationships: CodeRelationship[];
  files: string[];
}

export class ASTParser {
  private nodes: Map<string, CodeNode> = new Map();
  private relationships: CodeRelationship[] = [];
  private files: string[] = [];

  parseFile(code: string, filePath: string): CodeNode[] {
    const fileNodes: CodeNode[] = [];
    
    try {
      const ast = babel.parse(code, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
      });

      traverse(ast, {
        FunctionDeclaration: (path) => {
          const node = this.extractNode(path, 'function', filePath, code);
          if (node) {
            this.nodes.set(node.id, node);
            fileNodes.push(node);
          }
        },
        ClassDeclaration: (path) => {
          const node = this.extractNode(path, 'class', filePath, code);
          if (node) {
            this.nodes.set(node.id, node);
            fileNodes.push(node);
            this.extractClassRelationships(path, node.id, filePath);
          }
        },
        VariableDeclaration: (path) => {
          path.get('declarations').forEach((declPath) => {
            if (declPath.isVariableDeclarator() && declPath.node.init) {
              const node = this.extractNode(declPath, 'variable', filePath, code);
              if (node) {
                this.nodes.set(node.id, node);
                fileNodes.push(node);
              }
            }
          });
        },
        ImportDeclaration: (path) => {
          this.extractImportRelationships(path, filePath);
        },
        CallExpression: (path) => {
          this.extractCallRelationships(path, filePath);
        },
      });
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
    }

    if (!this.files.includes(filePath)) {
      this.files.push(filePath);
    }

    return fileNodes;
  }

  private extractNode(path: any, type: string, filePath: string, code: string): CodeNode | null {
    const node = path.node;
    const loc = node.loc;
    
    if (!loc) return null;

    const name = this.getNodeName(node, type);
    if (!name) return null;

    const id = `${filePath}:${name}:${loc.start.line}`;

    return {
      id,
      type,
      name,
      file: filePath,
      line: loc.start.line,
      column: loc.start.column,
      dependencies: [],
      exports: [],
      imports: [],
      code: code.slice(loc.start, loc.end),
    };
  }

  private getNodeName(node: any, type: string): string | null {
    switch (type) {
      case 'function':
        return node.id?.name || 'anonymous';
      case 'class':
        return node.id?.name || 'anonymous';
      case 'variable':
        return node.id?.name || null;
      default:
        return null;
    }
  }

  private extractClassRelationships(path: any, nodeId: string, filePath: string) {
    const node = path.node;
    
    // Extends relationship
    if (node.superClass) {
      const superClass = this.getIdentifierName(node.superClass);
      if (superClass) {
        this.relationships.push({
          from: nodeId,
          to: superClass,
          type: 'extends',
          file: filePath,
        });
      }
    }

    // Implements relationship (TypeScript)
    if (node.implements) {
      node.implements.forEach((impl: any) => {
        const interfaceName = this.getIdentifierName(impl);
        if (interfaceName) {
          this.relationships.push({
            from: nodeId,
            to: interfaceName,
            type: 'implements',
            file: filePath,
          });
        }
      });
    }
  }

  private extractImportRelationships(path: any, filePath: string) {
    const node = path.node;
    const source = node.source.value;
    
    node.specifiers.forEach((spec: any) => {
      const localName = spec.local.name;
      const importedName = spec.imported?.name || 'default';
      
      const fromNode = Array.from(this.nodes.values()).find(
        (n) => n.file === filePath && n.name === localName
      );

      if (fromNode) {
        this.relationships.push({
          from: fromNode.id,
          to: source,
          type: 'import',
          file: filePath,
        });
      }
    });
  }

  private extractCallRelationships(path: any, filePath: string) {
    const callee = path.node.callee;
    const calleeName = this.getIdentifierName(callee);
    
    if (!calleeName) return;

    const fromNode = this.findNodeAtLocation(filePath, path.node.loc);
    
    if (fromNode) {
      this.relationships.push({
        from: fromNode.id,
        to: calleeName,
        type: 'call',
        file: filePath,
      });
    }
  }

  private getIdentifierName(node: any): string | null {
    if (!node) return null;
    
    if (node.type === 'Identifier') {
      return node.name;
    }
    
    if (node.type === 'MemberExpression') {
      const object = this.getIdentifierName(node.object);
      const property = this.getIdentifierName(node.property);
      return object && property ? `${object}.${property}` : null;
    }

    return null;
  }

  private findNodeAtLocation(filePath: string, loc: any): CodeNode | null {
    return Array.from(this.nodes.values()).find(
      (node) => 
        node.file === filePath &&
        node.line <= loc.start.line &&
        loc.end.line <= node.line + 10
    ) || null;
  }

  getParsedCodebase(): ParsedCodebase {
    return {
      nodes: Array.from(this.nodes.values()),
      relationships: this.relationships,
      files: this.files,
    };
  }

  reset() {
    this.nodes.clear();
    this.relationships = [];
    this.files = [];
  }
}
