import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from 'lucide-react';

/**
 * API Documentation Page
 * 
 * Interactive API documentation for all tRPC procedures
 */
export default function ApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = {
    auth: [
      {
        name: 'auth.me',
        method: 'query',
        description: 'Get current authenticated user',
        auth: 'Optional',
        request: {},
        response: {
          id: 1,
          openId: 'user_123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
        },
      },
      {
        name: 'auth.logout',
        method: 'mutation',
        description: 'Logout current user',
        auth: 'Required',
        request: {},
        response: { success: true },
      },
    ],
    agent: [
      {
        name: 'agent.chat',
        method: 'mutation',
        description: 'Send a message to the AI agent',
        auth: 'Required',
        request: {
          sessionId: 'string',
          message: 'string',
          model: 'gpt-4 | claude-3 | gemini-pro (optional)',
        },
        response: {
          response: 'AI generated response',
          sessionId: 'session_123',
        },
      },
      {
        name: 'agent.streamChat',
        method: 'subscription',
        description: 'Stream AI responses in real-time',
        auth: 'Required',
        request: {
          sessionId: 'string',
          message: 'string',
        },
        response: 'Server-Sent Events (SSE) stream',
      },
    ],
    mcp: [
      {
        name: 'mcp.listServers',
        method: 'query',
        description: 'List all available MCP servers',
        auth: 'Required',
        request: {},
        response: [
          {
            id: 'server_1',
            name: 'GitHub MCP Server',
            status: 'connected',
          },
        ],
      },
      {
        name: 'mcp.listTools',
        method: 'query',
        description: 'List all tools from MCP servers',
        auth: 'Required',
        request: { serverId: 'string (optional)' },
        response: [
          {
            name: 'create_repository',
            description: 'Create a new GitHub repository',
            inputSchema: {},
          },
        ],
      },
      {
        name: 'mcp.callTool',
        method: 'mutation',
        description: 'Execute an MCP tool',
        auth: 'Required',
        request: {
          serverId: 'string',
          toolName: 'string',
          arguments: 'object',
        },
        response: {
          content: 'Tool execution result',
        },
      },
    ],
    advanced: [
      {
        name: 'advanced.createScheduledTask',
        method: 'mutation',
        description: 'Schedule a task to run at specific time',
        auth: 'Required',
        request: {
          name: 'string',
          prompt: 'string',
          schedule: 'cron expression',
          type: 'cron | interval',
        },
        response: {
          id: 'task_123',
          status: 'active',
        },
      },
      {
        name: 'advanced.createWorkflow',
        method: 'mutation',
        description: 'Create a multi-step workflow',
        auth: 'Required',
        request: {
          name: 'string',
          steps: [
            {
              name: 'string',
              action: 'string',
              dependencies: ['string'],
            },
          ],
        },
        response: {
          id: 'workflow_123',
          status: 'pending',
        },
      },
      {
        name: 'advanced.getMemories',
        method: 'query',
        description: 'Retrieve stored memories',
        auth: 'Required',
        request: { type: 'preference | fact | context (optional)' },
        response: [
          {
            key: 'user_preference_theme',
            value: 'dark',
            type: 'preference',
          },
        ],
      },
    ],
    admin: [
      {
        name: 'admin.getStats',
        method: 'query',
        description: 'Get platform statistics',
        auth: 'Admin Only',
        request: {},
        response: {
          totalUsers: 100,
          activeUsers: 50,
          totalSessions: 500,
          activeSessions: 25,
        },
      },
      {
        name: 'admin.getUsers',
        method: 'query',
        description: 'Get all users',
        auth: 'Admin Only',
        request: {},
        response: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            role: 'user',
          },
        ],
      },
      {
        name: 'admin.updateUserRole',
        method: 'mutation',
        description: 'Update user role',
        auth: 'Admin Only',
        request: {
          userId: 'number',
          role: 'admin | user',
        },
        response: { success: true },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">API Documentation</h1>
              <p className="text-muted-foreground mt-1">
                Interactive documentation for Mr.Dark AI Agent Platform API
              </p>
            </div>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>How to use the Mr.Dark AI Agent Platform API</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Base URL</h3>
              <div className="bg-muted p-3 rounded-md font-mono text-sm">
                https://your-domain.manus.space/api/trpc
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                All API requests require authentication via session cookie. Login through the OAuth flow first.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Request Format</h3>
              <p className="text-sm text-muted-foreground mb-2">
                tRPC uses a specific URL format for queries and mutations:
              </p>
              <div className="bg-muted p-3 rounded-md font-mono text-sm space-y-2">
                <div>Query: GET /api/trpc/[router].[procedure]</div>
                <div>Mutation: POST /api/trpc/[router].[procedure]</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Rate Limiting</h3>
              <p className="text-sm text-muted-foreground">
                API requests are rate-limited to 100 requests per minute per user.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <Tabs defaultValue="auth" className="space-y-6">
          <TabsList>
            <TabsTrigger value="auth">Authentication</TabsTrigger>
            <TabsTrigger value="agent">AI Agent</TabsTrigger>
            <TabsTrigger value="mcp">MCP Tools</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {categoryEndpoints.map((endpoint) => (
                <Card key={endpoint.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-mono">{endpoint.name}</CardTitle>
                        <Badge variant={endpoint.method === 'query' ? 'default' : endpoint.method === 'mutation' ? 'secondary' : 'outline'}>
                          {endpoint.method.toUpperCase()}
                        </Badge>
                        <Badge variant={endpoint.auth === 'Admin Only' ? 'destructive' : endpoint.auth === 'Required' ? 'default' : 'outline'}>
                          {endpoint.auth}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(endpoint.name, endpoint.name)}
                      >
                        {copiedEndpoint === endpoint.name ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <CardDescription>{endpoint.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Request */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Request
                      </h4>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(endpoint.request, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Response */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Response
                      </h4>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
                          {typeof endpoint.response === 'string'
                            ? endpoint.response
                            : JSON.stringify(endpoint.response, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* Example */}
                    <div>
                      <h4 className="font-semibold mb-2">Example Usage</h4>
                      <div className="bg-muted p-4 rounded-md">
                        <pre className="text-sm overflow-x-auto">
{`// Using tRPC client
const result = await trpc.${endpoint.name}.${endpoint.method}(${
  Object.keys(endpoint.request).length > 0
    ? JSON.stringify(endpoint.request, null, 2)
    : ''
});`}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          ))}
        </Tabs>

        {/* Tools Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Available Tools (168+)</CardTitle>
            <CardDescription>Comprehensive toolset from Codex, GPT-5, Claude 4, Cursor, and Manus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { category: 'Code Tools', count: 45, description: 'Code completion, refactoring, debugging' },
                { category: 'Browser Tools', count: 12, description: 'Web automation and scraping' },
                { category: 'File Tools', count: 18, description: 'File operations and management' },
                { category: 'Search Tools', count: 8, description: 'Web search and information retrieval' },
                { category: 'MCP Tools', count: 25, description: 'External MCP server integrations' },
                { category: 'Workflow Tools', count: 15, description: 'Workflow orchestration and automation' },
                { category: 'Memory Tools', count: 10, description: 'Context and preference management' },
                { category: 'Scheduling Tools', count: 8, description: 'Task scheduling and cron jobs' },
                { category: 'Docker Tools', count: 12, description: 'Container management and orchestration' },
                { category: 'GitHub Tools', count: 15, description: 'Repository operations and CI/CD' },
              ].map((tool) => (
                <Card key={tool.category}>
                  <CardHeader>
                    <CardTitle className="text-base">{tool.category}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tool.count}</div>
                    <p className="text-xs text-muted-foreground">tools available</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
