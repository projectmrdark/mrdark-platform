/**
 * Workflow Templates
 * 
 * Pre-built workflow templates for common tasks:
 * - Code Review Workflow
 * - Data Analysis Pipeline
 * - Web Scraping Workflow
 * - API Integration Workflow
 * - Testing Workflow
 * - Deployment Workflow
 */

import type { WorkflowConfig } from './workflow';

export class WorkflowTemplates {
  /**
   * Code Review Workflow
   * Automated code review with quality checks
   */
  static codeReview(userId: number, sessionId: number, repoUrl: string): WorkflowConfig {
    return {
      id: `code-review-${Date.now()}`,
      name: 'Code Review Workflow',
      description: 'Automated code review with quality analysis',
      userId,
      sessionId,
      steps: [
        {
          id: 'clone-repo',
          name: 'Clone Repository',
          prompt: `Clone the repository from ${repoUrl}`,
          parallel: false,
        },
        {
          id: 'analyze-structure',
          name: 'Analyze Code Structure',
          prompt: 'Analyze the codebase structure and identify main components',
          dependencies: ['clone-repo'],
          parallel: false,
        },
        {
          id: 'check-style',
          name: 'Check Code Style',
          prompt: 'Run linting and style checks on the codebase',
          dependencies: ['clone-repo'],
          parallel: true,
        },
        {
          id: 'check-security',
          name: 'Security Scan',
          prompt: 'Scan for security vulnerabilities and common issues',
          dependencies: ['clone-repo'],
          parallel: true,
        },
        {
          id: 'check-tests',
          name: 'Run Tests',
          prompt: 'Execute all tests and report coverage',
          dependencies: ['clone-repo'],
          parallel: true,
        },
        {
          id: 'generate-report',
          name: 'Generate Review Report',
          prompt: 'Compile all findings into a comprehensive review report',
          dependencies: ['analyze-structure', 'check-style', 'check-security', 'check-tests'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Data Analysis Pipeline
   * End-to-end data analysis workflow
   */
  static dataAnalysis(userId: number, sessionId: number, dataSource: string): WorkflowConfig {
    return {
      id: `data-analysis-${Date.now()}`,
      name: 'Data Analysis Pipeline',
      description: 'Complete data analysis from ingestion to visualization',
      userId,
      sessionId,
      steps: [
        {
          id: 'load-data',
          name: 'Load Data',
          prompt: `Load data from ${dataSource}`,
          parallel: false,
        },
        {
          id: 'clean-data',
          name: 'Data Cleaning',
          prompt: 'Clean and preprocess the data: handle missing values, remove duplicates, fix data types',
          dependencies: ['load-data'],
          parallel: false,
        },
        {
          id: 'explore-data',
          name: 'Exploratory Analysis',
          prompt: 'Perform exploratory data analysis: statistics, distributions, correlations',
          dependencies: ['clean-data'],
          parallel: false,
        },
        {
          id: 'visualize-distributions',
          name: 'Visualize Distributions',
          prompt: 'Create visualizations for data distributions',
          dependencies: ['explore-data'],
          parallel: true,
        },
        {
          id: 'visualize-correlations',
          name: 'Visualize Correlations',
          prompt: 'Create correlation matrices and heatmaps',
          dependencies: ['explore-data'],
          parallel: true,
        },
        {
          id: 'statistical-tests',
          name: 'Statistical Tests',
          prompt: 'Perform relevant statistical tests',
          dependencies: ['explore-data'],
          parallel: true,
        },
        {
          id: 'generate-insights',
          name: 'Generate Insights',
          prompt: 'Compile findings and generate actionable insights',
          dependencies: ['visualize-distributions', 'visualize-correlations', 'statistical-tests'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Web Scraping Workflow
   * Automated web scraping with data extraction
   */
  static webScraping(userId: number, sessionId: number, targetUrl: string): WorkflowConfig {
    return {
      id: `web-scraping-${Date.now()}`,
      name: 'Web Scraping Workflow',
      description: 'Automated web scraping and data extraction',
      userId,
      sessionId,
      steps: [
        {
          id: 'analyze-structure',
          name: 'Analyze Page Structure',
          prompt: `Navigate to ${targetUrl} and analyze the page structure`,
          parallel: false,
        },
        {
          id: 'extract-data',
          name: 'Extract Data',
          prompt: 'Extract relevant data from the page',
          dependencies: ['analyze-structure'],
          parallel: false,
        },
        {
          id: 'validate-data',
          name: 'Validate Data',
          prompt: 'Validate extracted data for completeness and accuracy',
          dependencies: ['extract-data'],
          parallel: false,
        },
        {
          id: 'transform-data',
          name: 'Transform Data',
          prompt: 'Transform data into structured format',
          dependencies: ['validate-data'],
          parallel: false,
        },
        {
          id: 'save-data',
          name: 'Save Data',
          prompt: 'Save processed data to file or database',
          dependencies: ['transform-data'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * API Integration Workflow
   * Complete API integration and testing
   */
  static apiIntegration(userId: number, sessionId: number, apiUrl: string): WorkflowConfig {
    return {
      id: `api-integration-${Date.now()}`,
      name: 'API Integration Workflow',
      description: 'Complete API integration with testing',
      userId,
      sessionId,
      steps: [
        {
          id: 'analyze-api',
          name: 'Analyze API',
          prompt: `Analyze the API documentation and endpoints for ${apiUrl}`,
          parallel: false,
        },
        {
          id: 'test-auth',
          name: 'Test Authentication',
          prompt: 'Test API authentication and obtain access tokens',
          dependencies: ['analyze-api'],
          parallel: false,
        },
        {
          id: 'test-endpoints',
          name: 'Test Endpoints',
          prompt: 'Test all API endpoints and document responses',
          dependencies: ['test-auth'],
          parallel: false,
        },
        {
          id: 'create-client',
          name: 'Create API Client',
          prompt: 'Generate API client code with proper error handling',
          dependencies: ['test-endpoints'],
          parallel: false,
        },
        {
          id: 'write-tests',
          name: 'Write Integration Tests',
          prompt: 'Write comprehensive integration tests',
          dependencies: ['create-client'],
          parallel: false,
        },
        {
          id: 'generate-docs',
          name: 'Generate Documentation',
          prompt: 'Generate usage documentation and examples',
          dependencies: ['write-tests'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Testing Workflow
   * Comprehensive testing pipeline
   */
  static testing(userId: number, sessionId: number, projectPath: string): WorkflowConfig {
    return {
      id: `testing-${Date.now()}`,
      name: 'Testing Workflow',
      description: 'Comprehensive testing pipeline',
      userId,
      sessionId,
      steps: [
        {
          id: 'setup-env',
          name: 'Setup Test Environment',
          prompt: `Setup test environment for project at ${projectPath}`,
          parallel: false,
        },
        {
          id: 'unit-tests',
          name: 'Run Unit Tests',
          prompt: 'Execute all unit tests',
          dependencies: ['setup-env'],
          parallel: true,
        },
        {
          id: 'integration-tests',
          name: 'Run Integration Tests',
          prompt: 'Execute integration tests',
          dependencies: ['setup-env'],
          parallel: true,
        },
        {
          id: 'e2e-tests',
          name: 'Run E2E Tests',
          prompt: 'Execute end-to-end tests',
          dependencies: ['setup-env'],
          parallel: true,
        },
        {
          id: 'coverage-report',
          name: 'Generate Coverage Report',
          prompt: 'Generate test coverage report',
          dependencies: ['unit-tests', 'integration-tests', 'e2e-tests'],
          parallel: false,
        },
        {
          id: 'performance-tests',
          name: 'Performance Tests',
          prompt: 'Run performance and load tests',
          dependencies: ['coverage-report'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Deployment Workflow
   * Complete deployment pipeline
   */
  static deployment(userId: number, sessionId: number, environment: string): WorkflowConfig {
    return {
      id: `deployment-${Date.now()}`,
      name: 'Deployment Workflow',
      description: `Deploy to ${environment} environment`,
      userId,
      sessionId,
      steps: [
        {
          id: 'pre-deploy-checks',
          name: 'Pre-deployment Checks',
          prompt: 'Run pre-deployment validation checks',
          parallel: false,
        },
        {
          id: 'run-tests',
          name: 'Run Tests',
          prompt: 'Execute full test suite',
          dependencies: ['pre-deploy-checks'],
          parallel: false,
        },
        {
          id: 'build',
          name: 'Build Application',
          prompt: 'Build application for production',
          dependencies: ['run-tests'],
          parallel: false,
        },
        {
          id: 'backup',
          name: 'Backup Current Version',
          prompt: 'Create backup of current deployment',
          dependencies: ['build'],
          parallel: true,
        },
        {
          id: 'deploy',
          name: 'Deploy Application',
          prompt: `Deploy to ${environment} environment`,
          dependencies: ['build'],
          parallel: false,
        },
        {
          id: 'smoke-tests',
          name: 'Run Smoke Tests',
          prompt: 'Execute smoke tests on deployed application',
          dependencies: ['deploy'],
          parallel: false,
        },
        {
          id: 'monitor',
          name: 'Monitor Deployment',
          prompt: 'Monitor application health and performance',
          dependencies: ['smoke-tests'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Machine Learning Pipeline
   * Complete ML workflow from data to deployment
   */
  static mlPipeline(userId: number, sessionId: number, dataPath: string): WorkflowConfig {
    return {
      id: `ml-pipeline-${Date.now()}`,
      name: 'Machine Learning Pipeline',
      description: 'End-to-end ML workflow',
      userId,
      sessionId,
      steps: [
        {
          id: 'load-data',
          name: 'Load Training Data',
          prompt: `Load training data from ${dataPath}`,
          parallel: false,
        },
        {
          id: 'preprocess',
          name: 'Data Preprocessing',
          prompt: 'Preprocess and feature engineer the data',
          dependencies: ['load-data'],
          parallel: false,
        },
        {
          id: 'split-data',
          name: 'Split Dataset',
          prompt: 'Split data into train/validation/test sets',
          dependencies: ['preprocess'],
          parallel: false,
        },
        {
          id: 'train-model',
          name: 'Train Model',
          prompt: 'Train machine learning model',
          dependencies: ['split-data'],
          parallel: false,
        },
        {
          id: 'evaluate',
          name: 'Evaluate Model',
          prompt: 'Evaluate model performance on validation set',
          dependencies: ['train-model'],
          parallel: false,
        },
        {
          id: 'tune-hyperparameters',
          name: 'Hyperparameter Tuning',
          prompt: 'Optimize model hyperparameters',
          dependencies: ['evaluate'],
          parallel: false,
        },
        {
          id: 'final-test',
          name: 'Final Testing',
          prompt: 'Test final model on test set',
          dependencies: ['tune-hyperparameters'],
          parallel: false,
        },
        {
          id: 'export-model',
          name: 'Export Model',
          prompt: 'Export trained model for deployment',
          dependencies: ['final-test'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Documentation Generation Workflow
   * Automated documentation generation
   */
  static documentation(userId: number, sessionId: number, projectPath: string): WorkflowConfig {
    return {
      id: `documentation-${Date.now()}`,
      name: 'Documentation Generation',
      description: 'Generate comprehensive project documentation',
      userId,
      sessionId,
      steps: [
        {
          id: 'analyze-code',
          name: 'Analyze Codebase',
          prompt: `Analyze codebase at ${projectPath}`,
          parallel: false,
        },
        {
          id: 'generate-api-docs',
          name: 'Generate API Documentation',
          prompt: 'Generate API documentation from code',
          dependencies: ['analyze-code'],
          parallel: true,
        },
        {
          id: 'generate-user-guide',
          name: 'Generate User Guide',
          prompt: 'Create user guide and tutorials',
          dependencies: ['analyze-code'],
          parallel: true,
        },
        {
          id: 'generate-dev-guide',
          name: 'Generate Developer Guide',
          prompt: 'Create developer setup and contribution guide',
          dependencies: ['analyze-code'],
          parallel: true,
        },
        {
          id: 'generate-changelog',
          name: 'Generate Changelog',
          prompt: 'Generate changelog from git history',
          dependencies: ['analyze-code'],
          parallel: true,
        },
        {
          id: 'compile-docs',
          name: 'Compile Documentation',
          prompt: 'Compile all documentation into final format',
          dependencies: ['generate-api-docs', 'generate-user-guide', 'generate-dev-guide', 'generate-changelog'],
          parallel: false,
        },
      ],
    };
  }

  /**
   * Get all available templates
   */
  static getAllTemplates(): Array<{
    id: string;
    name: string;
    description: string;
    category: string;
  }> {
    return [
      {
        id: 'code-review',
        name: 'Code Review Workflow',
        description: 'Automated code review with quality checks',
        category: 'Development',
      },
      {
        id: 'data-analysis',
        name: 'Data Analysis Pipeline',
        description: 'End-to-end data analysis workflow',
        category: 'Data Science',
      },
      {
        id: 'web-scraping',
        name: 'Web Scraping Workflow',
        description: 'Automated web scraping and data extraction',
        category: 'Automation',
      },
      {
        id: 'api-integration',
        name: 'API Integration Workflow',
        description: 'Complete API integration with testing',
        category: 'Development',
      },
      {
        id: 'testing',
        name: 'Testing Workflow',
        description: 'Comprehensive testing pipeline',
        category: 'Quality Assurance',
      },
      {
        id: 'deployment',
        name: 'Deployment Workflow',
        description: 'Complete deployment pipeline',
        category: 'DevOps',
      },
      {
        id: 'ml-pipeline',
        name: 'Machine Learning Pipeline',
        description: 'End-to-end ML workflow',
        category: 'Data Science',
      },
      {
        id: 'documentation',
        name: 'Documentation Generation',
        description: 'Generate comprehensive project documentation',
        category: 'Documentation',
      },
    ];
  }

  /**
   * Create workflow from template
   */
  static createFromTemplate(
    templateId: string,
    userId: number,
    sessionId: number,
    params: Record<string, string>
  ): WorkflowConfig {
    switch (templateId) {
      case 'code-review':
        return this.codeReview(userId, sessionId, params.repoUrl || '');
      case 'data-analysis':
        return this.dataAnalysis(userId, sessionId, params.dataSource || '');
      case 'web-scraping':
        return this.webScraping(userId, sessionId, params.targetUrl || '');
      case 'api-integration':
        return this.apiIntegration(userId, sessionId, params.apiUrl || '');
      case 'testing':
        return this.testing(userId, sessionId, params.projectPath || '');
      case 'deployment':
        return this.deployment(userId, sessionId, params.environment || 'production');
      case 'ml-pipeline':
        return this.mlPipeline(userId, sessionId, params.dataPath || '');
      case 'documentation':
        return this.documentation(userId, sessionId, params.projectPath || '');
      default:
        throw new Error(`Unknown template: ${templateId}`);
    }
  }
}
