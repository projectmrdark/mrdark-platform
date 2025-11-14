/**
 * Bugbot - Automated Code Review and Bug Fixing
 * 
 * Inspired by Cursor's Bugbot feature:
 * - Automatic bug detection
 * - Code quality analysis
 * - Security vulnerability scanning
 * - Performance optimization suggestions
 * - Automated fixes with explanations
 * - Integration with version control
 */

import { invokeLLM } from '../_core/llm';
import type { Message } from '../_core/llm';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface BugReport {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'bug' | 'security' | 'performance' | 'style' | 'best-practice';
  file: string;
  line: number;
  column?: number;
  message: string;
  description: string;
  suggestedFix?: string;
  autoFixable: boolean;
}

export interface CodeReviewResult {
  file: string;
  issues: BugReport[];
  metrics: {
    complexity: number;
    maintainability: number;
    testCoverage?: number;
  };
  summary: string;
}

export interface FixResult {
  success: boolean;
  file: string;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  issuesFixed: string[];
}

export class Bugbot {
  /**
   * Review code file for issues
   */
  async reviewFile(filePath: string): Promise<CodeReviewResult> {
    console.log(`[Bugbot] Reviewing file: ${filePath}`);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const language = this.detectLanguage(filePath);

      // Analyze code for issues
      const issues = await this.analyzeCode(content, language, filePath);

      // Calculate metrics
      const metrics = await this.calculateMetrics(content, language);

      // Generate summary
      const summary = await this.generateSummary(issues, metrics);

      return {
        file: filePath,
        issues,
        metrics,
        summary,
      };
    } catch (error) {
      console.error(`[Bugbot] Failed to review file ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Review entire codebase
   */
  async reviewCodebase(rootPath: string): Promise<CodeReviewResult[]> {
    console.log(`[Bugbot] Reviewing codebase: ${rootPath}`);

    const files = await this.discoverCodeFiles(rootPath);
    const results: CodeReviewResult[] = [];

    for (const file of files) {
      try {
        const result = await this.reviewFile(file);
        results.push(result);
      } catch (error) {
        console.error(`[Bugbot] Failed to review ${file}:`, error);
      }
    }

    return results;
  }

  /**
   * Analyze code for issues
   */
  private async analyzeCode(
    code: string,
    language: string,
    filePath: string
  ): Promise<BugReport[]> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer. Analyze the code for bugs, security issues, performance problems, and style violations. Respond with JSON:
{
  "issues": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "category": "bug" | "security" | "performance" | "style" | "best-practice",
      "line": 42,
      "column": 10,
      "message": "Brief message",
      "description": "Detailed description",
      "suggestedFix": "How to fix it",
      "autoFixable": true | false
    }
  ]
}

Focus on:
- Actual bugs and errors
- Security vulnerabilities
- Performance bottlenecks
- Code smell and anti-patterns
- Best practice violations`,
          },
          {
            role: 'user',
            content: `Review this ${language} code:\n\nFile: ${filePath}\n\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'code_review',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                issues: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      severity: {
                        type: 'string',
                        enum: ['critical', 'high', 'medium', 'low'],
                      },
                      category: {
                        type: 'string',
                        enum: ['bug', 'security', 'performance', 'style', 'best-practice'],
                      },
                      line: { type: 'number' },
                      column: { type: 'number' },
                      message: { type: 'string' },
                      description: { type: 'string' },
                      suggestedFix: { type: 'string' },
                      autoFixable: { type: 'boolean' },
                    },
                    required: ['severity', 'category', 'line', 'message', 'description', 'autoFixable'],
                    additionalProperties: false,
                  },
                },
              },
              required: ['issues'],
              additionalProperties: false,
            },
          },
        },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return [];
      }

      const textContent = typeof content === 'string' ? content : '';
      const result = JSON.parse(textContent);

      return result.issues.map((issue: any, index: number) => ({
        id: `${filePath}-${index}`,
        severity: issue.severity,
        category: issue.category,
        file: filePath,
        line: issue.line,
        column: issue.column,
        message: issue.message,
        description: issue.description,
        suggestedFix: issue.suggestedFix,
        autoFixable: issue.autoFixable,
      }));
    } catch (error) {
      console.error('[Bugbot] Failed to analyze code:', error);
      return [];
    }
  }

  /**
   * Calculate code metrics
   */
  private async calculateMetrics(
    code: string,
    language: string
  ): Promise<{
    complexity: number;
    maintainability: number;
    testCoverage?: number;
  }> {
    // Simplified metrics calculation
    // In production, would use actual static analysis tools

    const lines = code.split('\n').length;
    const functions = (code.match(/function|const.*=.*=>|def /g) || []).length;
    const conditionals = (code.match(/if|else|switch|case|\?/g) || []).length;
    const loops = (code.match(/for|while|forEach|map|filter/g) || []).length;

    // Cyclomatic complexity (simplified)
    const complexity = Math.min(100, (conditionals + loops + functions) / Math.max(1, functions) * 10);

    // Maintainability index (simplified, 0-100 scale)
    const avgLineLength = code.length / lines;
    const maintainability = Math.max(0, 100 - (complexity * 0.5) - (avgLineLength / 2));

    return {
      complexity: Math.round(complexity),
      maintainability: Math.round(maintainability),
    };
  }

  /**
   * Generate review summary
   */
  private async generateSummary(
    issues: BugReport[],
    metrics: any
  ): Promise<string> {
    const critical = issues.filter(i => i.severity === 'critical').length;
    const high = issues.filter(i => i.severity === 'high').length;
    const medium = issues.filter(i => i.severity === 'medium').length;
    const low = issues.filter(i => i.severity === 'low').length;

    let summary = `Found ${issues.length} issue(s): `;
    if (critical > 0) summary += `${critical} critical, `;
    if (high > 0) summary += `${high} high, `;
    if (medium > 0) summary += `${medium} medium, `;
    if (low > 0) summary += `${low} low`;

    summary += `\nComplexity: ${metrics.complexity}/100, Maintainability: ${metrics.maintainability}/100`;

    return summary;
  }

  /**
   * Automatically fix issues
   */
  async autoFix(filePath: string, issueIds?: string[]): Promise<FixResult> {
    console.log(`[Bugbot] Auto-fixing issues in ${filePath}`);

    try {
      const originalCode = await fs.readFile(filePath, 'utf-8');
      const review = await this.reviewFile(filePath);

      // Filter to auto-fixable issues
      let issuesToFix = review.issues.filter(i => i.autoFixable);
      if (issueIds) {
        issuesToFix = issuesToFix.filter(i => issueIds.includes(i.id));
      }

      if (issuesToFix.length === 0) {
        return {
          success: false,
          file: filePath,
          originalCode,
          fixedCode: originalCode,
          explanation: 'No auto-fixable issues found',
          issuesFixed: [],
        };
      }

      // Generate fixed code
      const fixedCode = await this.generateFixedCode(
        originalCode,
        this.detectLanguage(filePath),
        issuesToFix
      );

      // Generate explanation
      const explanation = await this.generateFixExplanation(issuesToFix);

      return {
        success: true,
        file: filePath,
        originalCode,
        fixedCode,
        explanation,
        issuesFixed: issuesToFix.map(i => i.id),
      };
    } catch (error) {
      console.error(`[Bugbot] Failed to auto-fix ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Generate fixed code
   */
  private async generateFixedCode(
    originalCode: string,
    language: string,
    issues: BugReport[]
  ): Promise<string> {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: `You are an expert programmer. Fix the identified issues in the code while preserving functionality. Return only the fixed code, no explanations.`,
          },
          {
            role: 'user',
            content: `Fix these issues:\n${issues.map(i => `Line ${i.line}: ${i.message} - ${i.suggestedFix}`).join('\n')}\n\nOriginal code:\n\`\`\`${language}\n${originalCode}\n\`\`\``,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        return originalCode;
      }

      let fixedCode = typeof content === 'string' ? content : '';

      // Remove code block markers if present
      fixedCode = fixedCode.replace(/```[\w]*\n?/g, '').trim();

      return fixedCode;
    } catch (error) {
      console.error('[Bugbot] Failed to generate fixed code:', error);
      return originalCode;
    }
  }

  /**
   * Generate fix explanation
   */
  private async generateFixExplanation(issues: BugReport[]): Promise<string> {
    return `Fixed ${issues.length} issue(s):\n${issues.map((i, idx) => `${idx + 1}. Line ${i.line}: ${i.message}`).join('\n')}`;
  }

  /**
   * Apply fix to file
   */
  async applyFix(fixResult: FixResult): Promise<void> {
    if (!fixResult.success) {
      throw new Error('Cannot apply unsuccessful fix');
    }

    await fs.writeFile(fixResult.file, fixResult.fixedCode, 'utf-8');
    console.log(`[Bugbot] Applied fix to ${fixResult.file}`);
  }

  /**
   * Scan for security vulnerabilities
   */
  async scanSecurity(rootPath: string): Promise<BugReport[]> {
    console.log(`[Bugbot] Scanning for security vulnerabilities: ${rootPath}`);

    const files = await this.discoverCodeFiles(rootPath);
    const vulnerabilities: BugReport[] = [];

    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const issues = await this.analyzeCode(content, this.detectLanguage(file), file);
        vulnerabilities.push(...issues.filter(i => i.category === 'security'));
      } catch (error) {
        console.error(`[Bugbot] Failed to scan ${file}:`, error);
      }
    }

    return vulnerabilities;
  }

  /**
   * Detect programming language from file extension
   */
  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const langMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.go': 'go',
      '.rs': 'rust',
      '.rb': 'ruby',
      '.php': 'php',
    };
    return langMap[ext] || 'text';
  }

  /**
   * Discover code files in directory
   */
  private async discoverCodeFiles(rootPath: string): Promise<string[]> {
    const files: string[] = [];
    const codeExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.go', '.rs', '.rb', '.php'];
    const ignorePatterns = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

    async function walk(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            if (ignorePatterns.some(pattern => entry.name.includes(pattern))) {
              continue;
            }
            await walk(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (codeExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.warn(`[Bugbot] Failed to read directory ${dir}:`, error);
      }
    }

    await walk(rootPath);
    return files;
  }

  /**
   * Generate code review report
   */
  async generateReport(results: CodeReviewResult[]): Promise<string> {
    const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
    const criticalIssues = results.reduce(
      (sum, r) => sum + r.issues.filter(i => i.severity === 'critical').length,
      0
    );

    let report = `# Code Review Report\n\n`;
    report += `## Summary\n\n`;
    report += `- Files reviewed: ${results.length}\n`;
    report += `- Total issues: ${totalIssues}\n`;
    report += `- Critical issues: ${criticalIssues}\n\n`;

    report += `## Issues by File\n\n`;
    for (const result of results) {
      if (result.issues.length > 0) {
        report += `### ${result.file}\n\n`;
        report += result.summary + '\n\n';

        for (const issue of result.issues) {
          report += `**[${issue.severity.toUpperCase()}]** Line ${issue.line}: ${issue.message}\n`;
          report += `${issue.description}\n`;
          if (issue.suggestedFix) {
            report += `*Suggested fix:* ${issue.suggestedFix}\n`;
          }
          report += '\n';
        }
      }
    }

    return report;
  }
}

// Singleton instance
export const bugbot = new Bugbot();
