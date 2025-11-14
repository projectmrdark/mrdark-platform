/**
 * Codebase Embedder
 * 
 * Inspired by Cursor's codebase embedding model that provides:
 * - Deep understanding of project structure
 * - Semantic code search
 * - File relationship mapping
 * - Context-aware suggestions
 * 
 * Uses embeddings to understand code semantically, not just syntactically.
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface CodeFile {
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: Date;
}

export interface CodeEmbedding {
  filePath: string;
  embedding: number[];
  summary: string;
  imports: string[];
  exports: string[];
  functions: string[];
  classes: string[];
}

export interface FileRelationship {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'calls' | 'references';
}

export interface CodebaseIndex {
  files: CodeEmbedding[];
  relationships: FileRelationship[];
  lastUpdated: Date;
}

export class CodebaseEmbedder {
  private index: CodebaseIndex = {
    files: [],
    relationships: [],
    lastUpdated: new Date(),
  };

  /**
   * Index entire codebase
   */
  async indexCodebase(rootPath: string): Promise<void> {
    console.log('[CodebaseEmbedder] Indexing codebase:', rootPath);
    
    const files = await this.discoverCodeFiles(rootPath);
    console.log(`[CodebaseEmbedder] Found ${files.length} code files`);

    // Process files in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);
      await Promise.all(batch.map(file => this.indexFile(file)));
      console.log(`[CodebaseEmbedder] Indexed ${Math.min(i + batchSize, files.length)}/${files.length} files`);
    }

    // Build relationship graph
    await this.buildRelationshipGraph();

    this.index.lastUpdated = new Date();
    console.log('[CodebaseEmbedder] Indexing complete');
  }

  /**
   * Discover all code files in directory
   */
  private async discoverCodeFiles(rootPath: string): Promise<CodeFile[]> {
    const files: CodeFile[] = [];
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb', '.php'];
    const ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

    async function walk(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            // Skip ignored directories
            if (ignorePatterns.some(pattern => entry.name.includes(pattern))) {
              continue;
            }
            await walk(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (codeExtensions.includes(ext)) {
              try {
                const content = await fs.readFile(fullPath, 'utf-8');
                const stats = await fs.stat(fullPath);
                files.push({
                  path: fullPath,
                  content,
                  language: ext.slice(1),
                  size: stats.size,
                  lastModified: stats.mtime,
                });
              } catch (error) {
                console.warn(`[CodebaseEmbedder] Failed to read file ${fullPath}:`, error);
              }
            }
          }
        }
      } catch (error) {
        console.warn(`[CodebaseEmbedder] Failed to read directory ${dir}:`, error);
      }
    }

    await walk(rootPath);
    return files;
  }

  /**
   * Index single file
   */
  private async indexFile(file: CodeFile): Promise<void> {
    try {
      // Analyze file structure
      const analysis = await this.analyzeFile(file);

      // Create embedding (simplified - in production would use actual embedding model)
      const embedding = await this.createEmbedding(file);

      this.index.files.push({
        filePath: file.path,
        embedding,
        summary: analysis.summary,
        imports: analysis.imports,
        exports: analysis.exports,
        functions: analysis.functions,
        classes: analysis.classes,
      });
    } catch (error) {
      console.error(`[CodebaseEmbedder] Failed to index file ${file.path}:`, error);
    }
  }

  /**
   * Analyze file structure using LLM
   */
  private async analyzeFile(file: CodeFile): Promise<{
    summary: string;
    imports: string[];
    exports: string[];
    functions: string[];
    classes: string[];
  }> {
    try {
      const messages: Message[] = [
        {
          role: 'system',
          content: `Analyze this ${file.language} code file and extract structure information. Respond with JSON:
{
  "summary": "brief description of what this file does",
  "imports": ["list of imported modules/files"],
  "exports": ["list of exported items"],
  "functions": ["list of function names"],
  "classes": ["list of class names"]
}`,
        },
        {
          role: 'user',
          content: `File: ${file.path}\n\n${file.content.slice(0, 4000)}`, // First 4000 chars
        },
      ];

      const response = await invokeLLM({
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'file_analysis',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                imports: { type: 'array', items: { type: 'string' } },
                exports: { type: 'array', items: { type: 'string' } },
                functions: { type: 'array', items: { type: 'string' } },
                classes: { type: 'array', items: { type: 'string' } },
              },
              required: ['summary', 'imports', 'exports', 'functions', 'classes'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from LLM');
      }

      const textContent = typeof content === 'string' ? content : '';
      return JSON.parse(textContent);
    } catch (error) {
      console.error(`[CodebaseEmbedder] Failed to analyze file ${file.path}:`, error);
      return {
        summary: '',
        imports: [],
        exports: [],
        functions: [],
        classes: [],
      };
    }
  }

  /**
   * Create embedding for file
   * In production, would use actual embedding model
   * For now, simplified hash-based approach
   */
  private async createEmbedding(file: CodeFile): Promise<number[]> {
    // Simplified: create a 384-dimensional embedding
    // In production, use OpenAI embeddings API or similar
    const embedding = new Array(384).fill(0);
    
    // Simple hash-based embedding for demonstration
    const hash = this.simpleHash(file.content);
    for (let i = 0; i < 384; i++) {
      embedding[i] = ((hash + i) % 1000) / 1000;
    }

    return embedding;
  }

  /**
   * Simple hash function for demonstration
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Build relationship graph between files
   */
  private async buildRelationshipGraph(): Promise<void> {
    this.index.relationships = [];

    for (const file of this.index.files) {
      // Create import relationships
      for (const importPath of file.imports) {
        const targetFile = this.resolveImportPath(file.filePath, importPath);
        if (targetFile) {
          this.index.relationships.push({
            from: file.filePath,
            to: targetFile,
            type: 'imports',
          });
        }
      }
    }
  }

  /**
   * Resolve import path to actual file path
   */
  private resolveImportPath(fromFile: string, importPath: string): string | null {
    // Simplified resolution - in production would handle all module resolution rules
    const fromDir = path.dirname(fromFile);
    
    // Handle relative imports
    if (importPath.startsWith('./') || importPath.startsWith('../')) {
      const resolved = path.resolve(fromDir, importPath);
      // Try common extensions
      for (const ext of ['.ts', '.tsx', '.js', '.jsx']) {
        const withExt = resolved + ext;
        if (this.index.files.some(f => f.filePath === withExt)) {
          return withExt;
        }
      }
    }

    return null;
  }

  /**
   * Search codebase semantically
   */
  async search(query: string, limit: number = 10): Promise<CodeEmbedding[]> {
    // Create query embedding
    const queryEmbedding = await this.createQueryEmbedding(query);

    // Calculate similarity scores
    const scores = this.index.files.map(file => ({
      file,
      score: this.cosineSimilarity(queryEmbedding, file.embedding),
    }));

    // Sort by score and return top results
    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, limit).map(s => s.file);
  }

  /**
   * Create embedding for search query
   */
  private async createQueryEmbedding(query: string): Promise<number[]> {
    // Simplified - same as file embedding
    return this.createEmbedding({
      path: '',
      content: query,
      language: '',
      size: 0,
      lastModified: new Date(),
    });
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Embeddings must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find files related to given file
   */
  findRelatedFiles(filePath: string): string[] {
    const related = new Set<string>();

    // Find direct relationships
    for (const rel of this.index.relationships) {
      if (rel.from === filePath) {
        related.add(rel.to);
      }
      if (rel.to === filePath) {
        related.add(rel.from);
      }
    }

    return Array.from(related);
  }

  /**
   * Get file summary
   */
  getFileSummary(filePath: string): string | null {
    const file = this.index.files.find(f => f.filePath === filePath);
    return file?.summary || null;
  }

  /**
   * Get codebase statistics
   */
  getStatistics() {
    return {
      totalFiles: this.index.files.length,
      totalRelationships: this.index.relationships.length,
      lastUpdated: this.index.lastUpdated,
      languages: this.getLanguageDistribution(),
    };
  }

  /**
   * Get language distribution
   */
  private getLanguageDistribution(): Record<string, number> {
    const dist: Record<string, number> = {};
    
    for (const file of this.index.files) {
      const ext = path.extname(file.filePath).slice(1);
      dist[ext] = (dist[ext] || 0) + 1;
    }

    return dist;
  }
}

// Singleton instance
export const codebaseEmbedder = new CodebaseEmbedder();
